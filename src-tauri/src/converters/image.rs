use std::fs::File;
use std::path::PathBuf;

use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;
use image::{DynamicImage, GenericImageView, ImageFormat};
use tauri::AppHandle;

use crate::file_ops::paths::validate_input_paths;
use crate::services::filesystem::{
    ensure_dir, file_stem, output_dir_or_current, path_to_string, unique_child_path,
};
use crate::services::progress::{check_cancelled, emit_progress};
use crate::state::AppState;
use crate::types::{CommandResult, ImageConvertOptions, OperationSummary, ResizeOptions};

pub fn convert_images(
    paths: Vec<String>,
    options: ImageConvertOptions,
    job_id: Option<String>,
    app: &AppHandle,
    state: &AppState,
) -> CommandResult<OperationSummary> {
    let cancel_job_id = job_id.clone();
    let progress_job_id = job_id.clone();
    convert_images_batch(
        paths,
        options,
        job_id,
        || check_cancelled(state, cancel_job_id.as_deref()),
        |progress, status, message| {
            emit_progress(app, progress_job_id.as_deref(), progress, status, message)
        },
    )
}

fn convert_images_batch<CheckCancelled, EmitProgress>(
    paths: Vec<String>,
    options: ImageConvertOptions,
    job_id: Option<String>,
    mut check_cancelled_fn: CheckCancelled,
    mut emit_progress_fn: EmitProgress,
) -> CommandResult<OperationSummary>
where
    CheckCancelled: FnMut() -> CommandResult<()>,
    EmitProgress: FnMut(u8, &str, String),
{
    let input_paths = validate_input_paths(&paths)?;
    let output_dir = output_dir_or_current(options.output_dir.as_deref())?;
    ensure_dir(&output_dir)?;

    let target_extension = normalize_target_format(&options.target_format)?;
    let mut outputs = Vec::new();
    let mut logs = Vec::new();
    let total = input_paths.len().max(1);

    emit_progress_fn(0, "running", "Converting images".to_string());

    for (index, input_path) in input_paths.iter().enumerate() {
        check_cancelled_fn()?;
        if !input_path.is_file() {
            logs.push(format!("Skipped non-file path: {}", input_path.display()));
            continue;
        }

        let image = image::open(input_path)
            .map_err(|error| format!("Failed to open image '{}': {error}", input_path.display()))?;
        let image = match &options.resize {
            Some(resize) => resize_image(image, resize),
            None => image,
        };

        let stem = file_stem(input_path, "image");
        let output_path = unique_child_path(&output_dir, &stem, target_extension, options.overwrite);
        save_image(&image, &output_path, target_extension, options.quality)?;

        if options.strip_exif {
            logs.push("EXIF stripped by re-encoding the image".to_string());
        } else {
            logs.push("TODO: metadata preservation adapter is not implemented".to_string());
        }

        logs.push(format!(
            "Converted {} -> {}",
            input_path.display(),
            output_path.display()
        ));
        outputs.push(path_to_string(&output_path));
        let progress = (((index + 1) * 100) / total) as u8;
        emit_progress_fn(
            progress,
            "running",
            format!("Converted {}", input_path.display()),
        );
    }

    emit_progress_fn(100, "success", "Image conversion complete".to_string());

    Ok(OperationSummary::success(
        job_id,
        "Images converted",
        outputs,
        logs,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, Rgba, RgbaImage};
    use std::fs;

    #[test]
    fn saves_supported_image_formats() {
        let image = sample_image();
        let test_dir = std::env::temp_dir().join(format!(
            "filekit-image-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time")
                .as_nanos()
        ));
        fs::create_dir_all(&test_dir).expect("create test dir");

        for extension in ["png", "jpg", "webp"] {
            let output_path = test_dir.join(format!("sample.{extension}"));
            save_image(&image, &output_path, extension, Some(80)).expect("save image");
            assert!(output_path.exists(), "expected {} to exist", output_path.display());
            image::open(&output_path).expect("saved image should be readable");
        }

        let _ = fs::remove_dir_all(test_dir);
    }

    #[test]
    fn converts_batch_to_supported_output_formats() {
        let test_dir = std::env::temp_dir().join(format!(
            "filekit-image-batch-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system time")
                .as_nanos()
        ));
        let input_dir = test_dir.join("input");
        let output_dir = test_dir.join("output");
        fs::create_dir_all(&input_dir).expect("create input dir");
        fs::create_dir_all(&output_dir).expect("create output dir");

        let input_path = input_dir.join("sample.png");
        sample_image()
            .save_with_format(&input_path, ImageFormat::Png)
            .expect("write input image");

        for target_format in ["webp", "jpg", "png"] {
            let format_output_dir = output_dir.join(target_format);
            fs::create_dir_all(&format_output_dir).expect("create format output dir");
            let mut progress_events = Vec::new();
            let summary = convert_images_batch(
                vec![input_path.to_string_lossy().to_string()],
                ImageConvertOptions {
                    target_format: target_format.to_string(),
                    output_dir: Some(format_output_dir.to_string_lossy().to_string()),
                    resize: Some(ResizeOptions {
                        width: Some(4),
                        height: None,
                        preserve_aspect_ratio: true,
                    }),
                    quality: Some(80),
                    strip_exif: true,
                    overwrite: false,
                },
                Some("test-job".to_string()),
                || Ok(()),
                |progress, status, message| {
                    progress_events.push((progress, status.to_string(), message))
                },
            )
            .expect("batch conversion should succeed");

            assert_eq!(summary.status, "success");
            assert_eq!(summary.output_paths.len(), 1);
            assert!(summary.output_paths[0].ends_with(target_format));
            assert!(PathBuf::from(&summary.output_paths[0]).exists());
            assert_eq!(progress_events.last().expect("progress event").0, 100);
        }

        let _ = fs::remove_dir_all(test_dir);
    }

    fn sample_image() -> DynamicImage {
        let mut image = RgbaImage::new(8, 8);
        for (x, y, pixel) in image.enumerate_pixels_mut() {
            let red = (x * 24) as u8;
            let green = (y * 24) as u8;
            *pixel = Rgba([red, green, 180, 255]);
        }
        DynamicImage::ImageRgba8(image)
    }
}

fn normalize_target_format(format: &str) -> CommandResult<&'static str> {
    match format.to_ascii_lowercase().as_str() {
        "jpg" | "jpeg" => Ok("jpg"),
        "png" => Ok("png"),
        "webp" => Ok("webp"),
        other => Err(format!("Unsupported image format: {other}")),
    }
}

fn resize_image(image: DynamicImage, resize: &ResizeOptions) -> DynamicImage {
    let (current_width, current_height) = image.dimensions();
    let width = resize.width.unwrap_or(current_width).max(1);
    let height = resize.height.unwrap_or(current_height).max(1);

    if resize.preserve_aspect_ratio {
        match (resize.width, resize.height) {
            (Some(width), None) => {
                let ratio = width as f32 / current_width.max(1) as f32;
                let height = (current_height as f32 * ratio).round().max(1.0) as u32;
                image.resize(width, height, FilterType::Lanczos3)
            }
            (None, Some(height)) => {
                let ratio = height as f32 / current_height.max(1) as f32;
                let width = (current_width as f32 * ratio).round().max(1.0) as u32;
                image.resize(width, height, FilterType::Lanczos3)
            }
            _ => image.resize(width, height, FilterType::Lanczos3),
        }
    } else {
        image.resize_exact(width, height, FilterType::Lanczos3)
    }
}

fn save_image(
    image: &DynamicImage,
    output_path: &PathBuf,
    extension: &str,
    quality: Option<u8>,
) -> CommandResult<()> {
    match extension {
        "jpg" => {
            let mut file = File::create(output_path).map_err(|error| {
                format!("Failed to create '{}': {error}", output_path.display())
            })?;
            let quality = quality.unwrap_or(85).clamp(1, 100);
            let mut encoder = JpegEncoder::new_with_quality(&mut file, quality);
            encoder
                .encode_image(image)
                .map_err(|error| format!("Failed to encode JPEG '{}': {error}", output_path.display()))
        }
        "png" => image
            .save_with_format(output_path, ImageFormat::Png)
            .map_err(|error| format!("Failed to encode PNG '{}': {error}", output_path.display())),
        "webp" => {
            // TODO: add a lossy WebP encoder adapter so the quality option applies to WebP.
            image
                .save_with_format(output_path, ImageFormat::WebP)
                .map_err(|error| format!("Failed to encode WebP '{}': {error}", output_path.display()))
        }
        _ => Err(format!("Unsupported image extension: {extension}")),
    }
}
