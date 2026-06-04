# BiztelAI IDP Workflow

This project is a Streamlit application designed to extract tabular data from handwritten industrial logs using Google Gemini's Structured Vision Outputs, validate the data against business rules, and provide a dashboard for human review and analytics.

## Installation

1. Create a virtual environment: `python -m venv venv`
2. Activate the virtual environment: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Make sure poppler is installed on your system (for pdf2image). On macOS, use `brew install poppler`.
5. Set your Gemini API key: `export GEMINI_API_KEY='your-key-here'`

## Running the app

Run the Streamlit app:
```bash
streamlit run app.py
```
