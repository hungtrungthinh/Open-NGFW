# Multi-stage build for Open-NGFW
FROM rust:1.75-alpine AS builder

# Install build dependencies
RUN apk add --no-cache musl-dev pkgconfig

# Set working directory
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release

# Remove dummy main.rs and copy real source
RUN rm src/main.rs
COPY src ./src
COPY static ./static

# Build the application
RUN cargo build --release

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache ca-certificates libc6-compat

# Create non-root user
RUN addgroup -g 1001 -S open-ngfw && \
    adduser -S open-ngfw -u 1001

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/target/release/open-ngfw /app/open-ngfw

# Copy static files
COPY --from=builder /app/static /app/static

# Change ownership
RUN chown -R open-ngfw:open-ngfw /app

# Switch to non-root user
USER open-ngfw

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/status || exit 1

# Run the application
CMD ["./open-ngfw"] 