mod commands;
mod compression;
mod converters;
mod file_ops;
mod hash;
mod pdf;
mod services;
mod state;
mod types;
mod workflows;

pub fn run() {
    tauri::Builder::default()
        .manage(state::AppState::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::compression::compress_files,
            commands::compression::extract_archive,
            commands::images::convert_images,
            commands::pdf::merge_pdfs,
            commands::pdf::split_pdf,
            commands::organizer::organize_files,
            commands::developer::calculate_hash,
            commands::developer::format_json,
            commands::developer::encode_base64,
            commands::developer::decode_base64,
            commands::developer::convert_yaml_json,
            commands::workflows::run_workflow,
            commands::workflows::cancel_job,
        ])
        .run(tauri::generate_context!())
        .expect("error while running FileKit");
}
