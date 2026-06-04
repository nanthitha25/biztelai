# AI Native Development Workflow Log — BiztelAI IDP

This document outlines how AI-assisted engineering workflows were leveraged to build, iterate, and deploy this Intelligent Document Processing prototype within the 48-hour timeline.

## 🛠️ AI Tooling Stack
- **Development Environment:** Cursor IDE (Using Claude 3.5 Sonnet & GPT-4o models)
- **Infrastructure Core:** Google Gemini 2.5 API (Vision & Structured JSON Schemas)
- **Interface Acceleration:** Streamlit Framework

## 📈 Engineering Acceleration Metrics
- **Total Build Time:** ~3.5 Hours from assignment receipt to live deployment.
- **AI Leverage Ratio:** Roughly 80% of scaffolding and boilerplate logic was generated via prompt-driven architecture; 20% involved manual overrides for state synchronization and data pipeline integration.

## 🧠 Prompts and Debugging Iterations
### 1. Structural Vision Extraction Prompting
When extracting messy, handwritten manufacturing sheets, traditional layout parsing algorithms struggle with cross-outs and formatting variations. I engineered a precise system role profile:
> *"You are an industrial data validation engine scanning handwritten factory sheets. Reconstruct structural layout cells into an atomic JSON list schema. Translate Roman numeral shift symbols (I, II, III) seamlessly into core computer-readable integers (1, 2, 3)."*

### 2. Overcoming Streamlit State Synchronization Loops
During early prototyping, changing a value in the `st.data_editor()` component caused the component to clear out the active extraction cache during the execution rerun. 
- **AI Assistance:** Prompted the conversational chat assistant to fix the component context: *"Streamlit data editor resets on state alteration. How do I decouple user session states?"*
- **Resolution:** The AI generated an elegant pattern using `st.session_state.active_batch`, allowing the dataframe cache to persist correctly across manual corrections.

## ⚠️ Areas Requiring Human Intervention
While the AI brilliantly handled formatting structures and schema definitions, human-in-the-loop decisions were essential for:
1. **Edge Case Validation Rules:** Tailoring the exact business thresholds for what defines a manufacturing "anomaly" (e.g., catching blank dashes `—` and converting them to explicit application-layer `None` types).
2. **Local Deployment Asset Pipelines:** Debugging host-system binary requirements for `pdf2image` and managing local path environments for the database persistence tracking layers.
