use std::fs;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &Path) -> Result<(), String> {
    fs::create_dir_all(path).map_err(|error| {
        format!(
            "Failed to create output directory '{}': {error}",
            path.display()
        )
    })
}

pub fn output_dir_or_current(output_dir: Option<&str>) -> Result<PathBuf, String> {
    match output_dir {
        Some(path) if !path.trim().is_empty() => Ok(PathBuf::from(path)),
        _ => std::env::current_dir().map_err(|error| format!("Failed to read current dir: {error}")),
    }
}

pub fn path_to_string(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

pub fn file_stem(path: &Path, fallback: &str) -> String {
    path.file_stem()
        .and_then(|name| name.to_str())
        .filter(|name| !name.trim().is_empty())
        .unwrap_or(fallback)
        .to_string()
}

pub fn file_name(path: &Path, fallback: &str) -> String {
    path.file_name()
        .and_then(|name| name.to_str())
        .filter(|name| !name.trim().is_empty())
        .unwrap_or(fallback)
        .to_string()
}

pub fn unique_child_path(dir: &Path, stem: &str, extension: &str, overwrite: bool) -> PathBuf {
    let clean_stem = sanitize_file_stem(stem);
    let clean_ext = extension.trim_start_matches('.');
    let first = if clean_ext.is_empty() {
        dir.join(&clean_stem)
    } else {
        dir.join(format!("{clean_stem}.{clean_ext}"))
    };

    if overwrite || !first.exists() {
        return first;
    }

    for index in 1.. {
        let candidate = if clean_ext.is_empty() {
            dir.join(format!("{clean_stem} ({index})"))
        } else {
            dir.join(format!("{clean_stem} ({index}).{clean_ext}"))
        };
        if !candidate.exists() {
            return candidate;
        }
    }

    first
}

pub fn unique_existing_path(path: &Path, overwrite: bool) -> PathBuf {
    if overwrite || !path.exists() {
        return path.to_path_buf();
    }

    let parent = path.parent().unwrap_or_else(|| Path::new("."));
    let stem = file_stem(path, "file");
    let extension = path.extension().and_then(|ext| ext.to_str()).unwrap_or("");
    unique_child_path(parent, &stem, extension, false)
}

fn sanitize_file_stem(input: &str) -> String {
    let trimmed = input.trim().trim_end_matches(".zip");
    let sanitized: String = trimmed
        .chars()
        .map(|ch| match ch {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '-',
            _ => ch,
        })
        .collect();

    if sanitized.trim().is_empty() {
        "filekit-output".to_string()
    } else {
        sanitized
    }
}
