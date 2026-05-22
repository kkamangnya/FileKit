use base64::{engine::general_purpose, Engine as _};
use tauri::{AppHandle, State};

use crate::hash::service;
use crate::state::AppState;
use crate::types::{CommandResult, HashResult};

#[tauri::command(async)]
pub fn calculate_hash(
    paths: Vec<String>,
    algorithm: String,
    job_id: Option<String>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> CommandResult<Vec<HashResult>> {
    let job_key = job_id.clone();
    let result = service::calculate_hashes(paths, algorithm, job_id, &app, state.inner());
    if let Some(job_id) = job_key {
        let _ = state.clear(&job_id);
    }
    result
}

#[tauri::command]
pub fn format_json(input: String, mode: String) -> CommandResult<String> {
    let value: serde_json::Value =
        serde_json::from_str(&input).map_err(|error| format!("Invalid JSON: {error}"))?;
    match mode.as_str() {
        "pretty" => serde_json::to_string_pretty(&value)
            .map_err(|error| format!("Failed to pretty-print JSON: {error}")),
        "minify" => serde_json::to_string(&value)
            .map_err(|error| format!("Failed to minify JSON: {error}")),
        other => Err(format!("Unsupported JSON format mode: {other}")),
    }
}

#[tauri::command]
pub fn encode_base64(input: String) -> String {
    general_purpose::STANDARD.encode(input.as_bytes())
}

#[tauri::command]
pub fn decode_base64(input: String) -> CommandResult<String> {
    let bytes = general_purpose::STANDARD
        .decode(input.trim())
        .map_err(|error| format!("Invalid Base64: {error}"))?;
    String::from_utf8(bytes).map_err(|error| format!("Decoded Base64 is not UTF-8: {error}"))
}

#[tauri::command]
pub fn convert_yaml_json(input: String, direction: String) -> CommandResult<String> {
    match direction.as_str() {
        "yaml-to-json" => {
            let value: serde_yaml::Value =
                serde_yaml::from_str(&input).map_err(|error| format!("Invalid YAML: {error}"))?;
            serde_json::to_string_pretty(&value)
                .map_err(|error| format!("Failed to convert YAML to JSON: {error}"))
        }
        "json-to-yaml" => {
            let value: serde_json::Value =
                serde_json::from_str(&input).map_err(|error| format!("Invalid JSON: {error}"))?;
            serde_yaml::to_string(&value)
                .map_err(|error| format!("Failed to convert JSON to YAML: {error}"))
        }
        other => Err(format!("Unsupported conversion direction: {other}")),
    }
}
