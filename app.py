import streamlit as st
import pandas as pd
from src.extractor import extract_operational_data
from src.validator import validate_records
from src.database import save_records_to_db, load_db_records
from pdf2image import convert_from_bytes
import io

st.set_page_config(page_title="BiztelAI IDP Workflow", layout="wide")
st.title("🏭 Manufacturing Operational IDP Portal")

# Persist batch dataset across app re-runs
if "active_batch" not in st.session_state:
    st.session_state.active_batch = []

tab1, tab2 = st.tabs(["📥 Document Ingestion & Review", "📊 Operational Insights Dashboard"])

with tab1:
    st.header("Upload Sheet Logs")
    uploaded_file = st.file_uploader("Upload Handwritten logs (JPG/PNG/PDF)", type=["jpg", "jpeg", "png", "pdf"])
    
    if uploaded_file is not None:
        file_bytes = uploaded_file.read()
        mime_type = uploaded_file.type
        
        # Handle PDF to Image conversion buffer if required
        if mime_type == "application/pdf":
            images = convert_from_bytes(file_bytes)
            img_byte_arr = io.BytesIO()
            images[0].save(img_byte_arr, format='JPEG')
            file_bytes = img_byte_arr.getvalue()
            mime_type = "image/jpeg"
            
        st.image(file_bytes, caption="Uploaded Operational Document Preview", width=500)
        
        if st.button("Process Document with Vision AI", type="primary"):
            with st.spinner("Digitizing handwritten layout cells..."):
                raw_rows = extract_operational_data(file_bytes, mime_type)
                processed_rows = validate_records(raw_rows)
                st.session_state.active_batch = processed_rows
                st.success("Extraction and Rule-Validation Complete!")

    # Editable Verification Frame
    if st.session_state.active_batch:
        st.subheader("📋 Verify and Correct Digitized Entry Records")
        st.caption("Fields highlighted with custom validation logs should be checked against source document entries.")
        
        df = pd.DataFrame(st.session_state.active_batch)
        
        # Create a styling function to highlight rows requiring audit
        def highlight_exceptions(row):
            if row["validation_flags"] != "Passed":
                return ["background-color: #4B2E2E; color: #FF9999;"] * len(row)
            return [""] * len(row)
        
        # Pass the styled dataframe to the editor
        styled_df = df.style.apply(highlight_exceptions, axis=1)
        edited_df = st.data_editor(styled_df, num_rows="dynamic", use_container_width=True)
        
        if st.button("Commit & Save Approved Log Batch"):
            # Persist batch updates locally to a global database CSV via database.py
            save_records_to_db(edited_df)
            st.toast("Records safely stored in history database!", icon="💾")
            st.session_state.active_batch = []

with tab2:
    st.header("📈 Real-time Manufacturing Insights")
    try:
        db_df = load_db_records()
        
        # Metric Grid
        kpi1, kpi2, kpi3 = st.columns(3)
        kpi1.metric("Total Records Digitized", len(db_df))
        kpi2.metric("Total Component Output Volume", int(db_df["quantity_produced"].sum()))
        
        fail_count = len(db_df[db_df["validation_flags"] != "Passed"])
        kpi3.metric("Flagged Exception Anomalies", fail_count, delta=f"{fail_count} requires audit", delta_color="inverse")
        
        # Machine-wise Metrics
        st.subheader("Machine-wise Output Breakdown")
        machine_chart_data = db_df.groupby("machine_number")["quantity_produced"].sum()
        st.bar_chart(machine_chart_data)
        
    except FileNotFoundError:
        st.info("No data available yet. Please process and save logs inside the ingestion terminal tab.")
