# Dockerfile for Compass Outlaw Legal Document Generation
# Version: Nuclear Option v26.0 - XeLaTeX with Absolute Layout Support
# Purpose: CRC 2.111 compliant PDF generation with textpos absolute positioning

FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm

# Install TeX Live with XeLaTeX and required packages
RUN apt-get update && apt-get install -y \
    texlive-xetex \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-recommended \
    fonts-liberation \
    python3 \
    python3-pip \
    ghostscript \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for PDF validation
RUN pip3 install --no-cache-dir \
    PyPDF2 \
    pikepdf \
    python-dotenv

# Set working directory
WORKDIR /workspace

# Copy LaTeX class file and templates
COPY cal-pleading.cls /workspace/
COPY Statement_of_Dispute.tex /workspace/
COPY clerk_bot.py /workspace/

# Create output directories
RUN mkdir -p /workspace/output /workspace/validation_reports

# Set permissions
RUN chmod +x /workspace/clerk_bot.py

# Default command: compile PDF with XeLaTeX
CMD ["xelatex", "-interaction=nonstopmode", "-output-directory=/workspace/output", "Statement_of_Dispute.tex"]

# Health check: verify XeLaTeX is available
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD xelatex --version || exit 1

# Labels
LABEL maintainer="Recovery Compass Legal Tech Team"
LABEL version="26.0"
LABEL description="Nuclear Option LaTeX compiler with absolute textpos layout for California court filings"
LABEL compliance="CRC 2.111, M-001, M-003, M-021 Nuclear Option"
