### **1. Project Description**

**Project Overview**:

The **GDPR and HIPAA Violation Detection Tool** aims to build an AI-powered solution that can automatically detect **violations** of **GDPR** (General Data Protection Regulation) and **HIPAA** (Health Insurance Portability and Accountability Act) in **meeting recordings** and **CSV data**. The tool will analyze the data for the presence of **PII (Personally Identifiable Information)** and **PHI (Protected Health Information)** and flag any violations of compliance.

- **GDPR**: Focuses on protecting personal data, ensuring that businesses handle sensitive personal information (like names, email addresses, phone numbers) in compliance with the regulation.
- **HIPAA**: Focuses on the protection of health-related data, ensuring that medical information (like patient records, medical diagnoses, prescriptions) is protected from unauthorized access or sharing.

---

### **2. Solution We Are Working On**

**Goal**:

Our solution will leverage **IBM Granite models** to process both **speech-to-text** and **text analysis** for detecting **GDPR** and **HIPAA** violations in **real-time**.

---

### **Solution Approach:**

1. **Data Upload**:
   - Users will upload a **CSV file** or **meeting recording** (audio file) for analysis.
2. **Violation Detection**:
   - We will use **Granite Speech 8B** (for speech-to-text) to convert audio recordings into text.
   - The extracted text will be analyzed for violations of **GDPR** and **HIPAA** using **Granite Instruct** (for text analysis).
3. **Rule Cross-Referencing**:
   - The tool will **cross-reference** the detected data with the **GDPR** and **HIPAA rules** (extracted from the **preloaded PDFs** or user-uploaded rule files).
   - It will then flag any **PII** or **PHI** violations.
4. **Reporting**:
   - Upon detecting a violation, the tool will generate a **PDF report** detailing the violation and the specific **GDPR/HIPAA rule** that was violated.
5. **Dashboard**:
   - A **React UI dashboard** will be built to **display** the violations in a structured format, with **interactive charts** for visualizing the detected violations (e.g., pie charts, bar charts).

---

### **3. Key Features of the Tool**:

- **Real-Time Violation Detection**: Detects and flags **GDPR** and **HIPAA violations** in real-time from audio files and CSV data.
- **Cross-Referencing with Legal Rules**: Uses **preloaded GDPR/HIPAA rules** to validate the compliance of the data.
- **Interactive Dashboard**: Displays violations with **charts**, **tables**, and **detailed reports**.
- **PDF Report Generation**: Generates downloadable **PDF reports** that specify **which GDPR/HIPAA rules** were violated and what data caused the violation.

---

### **4. Project Tasks and Responsibilities**

### **Task 1: Data Processing & Rule Validation**

- **Subtasks**:
  - Parse **GDPR** and **HIPAA** PDF files for rule extraction.
  - Implement logic to detect **PII** (e.g., names, emails, phone numbers) and **PHI** (e.g., health data, medical terms) in **CSV files**.

### **Task 2: Granite Integration**

- **Subtasks**:
  - Set up **Granite Speech 8B** for **speech-to-text** and **Granite Instruct** for **text analysis**.
  - Use the models to **transcribe meeting audio** and **detect violations** in the transcribed text.

### **Task 3: Real-Time Detection & Reporting**

- **Subtasks**:
  - Detect violations in **real-time** using the **Granite models**.
  - **Generate PDF reports** of detected violations with details of which **GDPR/HIPAA rules** were violated.

### **Task 4: Frontend Development (Shravan)**

- **Subtasks**:
  - **Shravan** will handle the **frontend** using **Loveable AI**.
  - Design the **interactive dashboard** to display violations and statistics.
  - Integrate the frontend with the **backend** using **Firebase** for real-time data storage.

### **Task 5: System Integration and Testing**

- **Subtasks**:
  - Integrate **Granite models** into the system and test the overall **violation detection** functionality.
  - Ensure that the **real-time detection** and **report generation** work smoothly.
  - **Test the frontend** to ensure data is being displayed properly.

---

### **5. System Requirements**

- **RAM**: 32 GB (recommended for **Granite models**).
- **GPU**: Required for optimal performance with **Granite models**.
- **Tools**:
  - **React** for the **frontend** and **dashboard functionality**.
  - **Firebase** for the **backend database**.
  - **API** Fast API for interaction.

---

### **6. Concerns Raised by Sandeep Sir**

- **PII and PHI Differentiation**:
  - Ensure the system clearly differentiates between **PII** and **PHI** fields in the data.
- **Real-Time Monitoring**:
  - The system must detect and show violations **in real-time** on the dashboard.

---

### **7. How Shravan Can Contribute**

- **Frontend Development**: **Shravan** will build the **frontend** using **Loveable AI**.
  - Design an **interactive dashboard** that displays **GDPR and HIPAA violation detection** results.
  - Integrate the frontend with **Firebase** for **data storage**.
- **Backend Integration**: **Shravan** will also handle **database management** and ensure **real-time updates** from the **backend**.

---

### **8. Action Plan**

1. **Shravan**: Focus on the **frontend** and **backend integration** with **Firebase**.
2. **Shoury**: Continue working on the **Granite model integration** (speech-to-text, text analysis), test the **violation detection**, and build the **report generation** system.
3. **Collaboration**: Regular sync-ups to ensure smooth progress and integration.
