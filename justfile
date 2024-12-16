# justfile for Tauri app development

# Set the default target
default_target := "dev"

# Install dependencies
install:
    # Install Rust dependencies
    cargo install --locked
    # Install Node.js dependencies (if using a frontend with Node)
    npm install

# Build the Tauri app
build:
    # Build the frontend assets (usually with a bundler like webpack, vite, etc.)
    npm run tauri build

# Run the Tauri app in development mode (with live reloading)
dev:
    # Run frontend dev server (e.g., Vite, Webpack, etc.)
    WEBKIT_DISABLE_DMABUF_RENDERER=1 pnpm tauri dev

# Test the app
test:
    # Run frontend tests (e.g., Jest)
    npm run test
    # Run Rust tests for Tauri backend
    cargo test

# Install and run the app in one step (install, build, and run)
install-run:
    just install
    just build
    just dev

# Build and package the app in one step
build-package:
    just build
    just package
