import streamlit as st
import pandas as pd
import re
import fitz  # PyMuPDF for PDF parsing
import matplotlib.pyplot as plt
import plotly.express as px
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

# Title of the app
st.title("GraniteRegulate: Real-Time Compliance Monitoring")

# Dropdown for selecting compliance rule (GDPR or HIPAA)
compliance_rule = st.selectbox("Select Compliance Rule", ["GDPR", "HIPAA"])

# File uploader to load the CSV
st.subheader("Upload your CSV file for analysis")
uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

# File uploader for custom rule files
st.subheader("Upload custom GDPR/HIPAA rule file (optional)")
uploaded_rules = st.file_uploader("Upload a custom rules PDF (GDPR or HIPAA)", type="pdf")

# Path to default rule files (you need to have these in 'rules' folder)
default_gdpr_path = "backend/rules/GDPR_RULES.pdf"
default_hipaa_path = "backend/rules/HIPAA_RULES.pdf"

# Function to extract text from PDFs
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text()
    return full_text

# Load default rule file if no custom file is uploaded
def load_rules():
    if uploaded_rules is not None:
        return extract_text_from_pdf(uploaded_rules)
    else:
        if compliance_rule == "GDPR":
            return extract_text_from_pdf(default_gdpr_path)
        elif compliance_rule == "HIPAA":
            return extract_text_from_pdf(default_hipaa_path)

# Function to check for PII (example: email, phone)
def check_pii(text):
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'\+?\d{1,4}?[.-]?\(?\d{1,3}?\)?[.-]?\d{1,4}[.-]?\d{1,4}[.-]?\d{1,4}'
    if re.search(email_pattern, text) or re.search(phone_pattern, text):
        return True
    return False

# Function to check for PHI (example: medical terms for HIPAA)
def check_phi(text):
    health_keywords = ['patient', 'medical', 'doctor', 'condition', 'treatment', 'prescription']
    if any(keyword in text.lower() for keyword in health_keywords):
        return True
    return False

# Function to check for GDPR Violations (e.g., personal data)
def check_gdpr(text):
    gdpr_keywords = [
        'name', 'email', 'phone', 'address', 'social security', 'account number', 
        'ssn', 'telephone', 'cellphone', 'passport', 'driver\'s license'
    ]
    ssn_pattern = r'\d{3}-\d{2}-\d{4}'
    phone_pattern = r'\+?\d{1,4}?[.-]?\(?\d{1,3}?\)?[.-]?\d{1,4}[.-]?\d{1,4}[.-]?\d{1,4}'
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    
    if any(keyword in text.lower() for keyword in gdpr_keywords):
        return True
    if re.search(ssn_pattern, text) or re.search(phone_pattern, text) or re.search(email_pattern, text):
        return True
    return False

# Function to generate violation report in PDF
def generate_violation_report(violations, file_name="Violation_Report.pdf"):
    save_path = "generated_reports"
    if not os.path.exists(save_path):
        os.makedirs(save_path)
    
    file_path = os.path.join(save_path, file_name)
    c = canvas.Canvas(file_path, pagesize=letter)
    c.drawString(100, 750, "Violation Report - GDPR/HIPAA Compliance")
    y_position = 730
    for violation in violations:
        c.drawString(100, y_position, violation)
        y_position -= 20
    c.save()

    return file_path

# If the file is uploaded, read and display the data
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.write("Data Preview:")
    st.write(df)

    # Load the rules text
    rules_text = load_rules()

    # Analyze the data for violations based on selected rule (GDPR and/or HIPAA)
    st.subheader(f"Analysis for Violations")

    gdpr_selected = st.checkbox("Check GDPR Violations")
    hipaa_selected = st.checkbox("Check HIPAA Violations")

    violations = []

    # Iterate over rows in the dataframe to check for violations
    for index, row in df.iterrows():
        for col in df.columns:
            text = str(row[col])

            if gdpr_selected and check_gdpr(text):
                violations.append(f"GDPR Violation found in row {index + 1}, column '{col}'")
            if hipaa_selected and check_phi(text):
                violations.append(f"PHI Violation found in row {index + 1}, column '{col}'")

    # Display violations
    if violations:
        st.write("Violations Found:")
        st.write("\n".join(violations))
        
        # Generate and allow download of the report
        if st.button('Generate Report'):
            report_file = generate_violation_report(violations)
            st.success("Report generated successfully!")
            st.download_button("Download Report", report_file, file_name="Violation_Report.pdf")
        
        # Display violation stats in a chart
        violations_count = len(violations)
        st.subheader(f"Total Violations: {violations_count}")

        # Visualization (pie chart of violations)
        fig = plt.figure(figsize=(6, 6))
        labels = ['Violations', 'No Violations']
        sizes = [violations_count, len(df) - violations_count]
        if sizes[0] == 0 or sizes[1] == 0:
            sizes = [max(sizes), max(sizes) + 1]  # Avoid zero values in pie chart
        plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')  # Equal aspect ratio ensures pie is drawn as a circle.
        st.pyplot(fig)

        # Plot a bar chart for violations per column
        violation_counts = {col: 0 for col in df.columns}
        for index, row in df.iterrows():
            for col in df.columns:
                text = str(row[col])
                if gdpr_selected and check_gdpr(text):
                    violation_counts[col] += 1
                elif hipaa_selected and check_phi(text):
                    violation_counts[col] += 1

        st.subheader(f"Violations per Column")
        violation_data = pd.DataFrame(list(violation_counts.items()), columns=['Column', 'Violations'])
        st.bar_chart(violation_data.set_index('Column'))
    else:
        st.write("No Violations Found.")
