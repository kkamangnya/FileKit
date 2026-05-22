use serde::{Deserialize, Serialize};

pub type CommandResult<T> = Result<T, String>;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OperationSummary {
    pub job_id: Option<String>,
    pub status: String,
    pub message: String,
    pub output_paths: Vec<String>,
    pub logs: Vec<String>,
}

impl OperationSummary {
    pub fn success(
        job_id: Option<String>,
        message: impl Into<String>,
        output_paths: Vec<String>,
        logs: Vec<String>,
    ) -> Self {
        Self {
            job_id,
            status: "success".to_string(),
            message: message.into(),
            output_paths,
            logs,
        }
    }

    pub fn pending(job_id: Option<String>, message: impl Into<String>, logs: Vec<String>) -> Self {
        Self {
            job_id,
            status: "pending".to_string(),
            message: message.into(),
            output_paths: Vec::new(),
            logs,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressPayload {
    pub job_id: String,
    pub progress: u8,
    pub status: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HashResult {
    pub path: String,
    pub algorithm: String,
    pub hash: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompressionOptions {
    pub format: String,
    pub output_dir: Option<String>,
    pub output_name: Option<String>,
    pub password: Option<String>,
    pub split_size_mb: Option<u64>,
    pub preserve_paths: bool,
    pub overwrite: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractOptions {
    pub output_dir: Option<String>,
    pub password: Option<String>,
    pub overwrite: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResizeOptions {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub preserve_aspect_ratio: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageConvertOptions {
    pub target_format: String,
    pub output_dir: Option<String>,
    pub resize: Option<ResizeOptions>,
    pub quality: Option<u8>,
    pub strip_exif: bool,
    pub overwrite: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfMergeOptions {
    pub output_dir: Option<String>,
    pub output_name: Option<String>,
    pub overwrite: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfSplitOptions {
    pub output_dir: Option<String>,
    pub split_mode: String,
    pub page_ranges: Option<Vec<String>>,
    pub overwrite: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrganizeOptions {
    pub mode: String,
    pub output_dir: String,
    pub preserve_original: bool,
    pub overwrite: bool,
    pub preset: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkflowStep {
    pub id: String,
    pub kind: String,
    pub label: String,
    pub enabled: bool,
    pub config: serde_json::Value,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkflowDefinition {
    pub name: String,
    pub input_paths: Vec<String>,
    pub output_dir: Option<String>,
    pub steps: Vec<WorkflowStep>,
}
