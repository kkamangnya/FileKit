use std::path::PathBuf;

pub fn validate_input_paths(paths: &[String]) -> Result<Vec<PathBuf>, String> {
    if paths.is_empty() {
        return Err("No input files were provided".to_string());
    }

    paths
        .iter()
        .map(|path| {
            let path_buf = PathBuf::from(path);
            if path_buf.exists() {
                Ok(path_buf)
            } else {
                Err(format!("Input path does not exist: {}", path_buf.display()))
            }
        })
        .collect()
}
