# **GraniteRegulate: AI-Powered GDPR and HIPAA Compliance Tool**

## **1. Project Overview**

**GraniteRegulate** is an advanced, AI-powered solution designed to automatically detect violations of the **General Data Protection Regulation (GDPR)** and the **Health Insurance Portability and Accountability Act (HIPAA)** in corporate data. By analyzing meeting recordings and structured data files, our tool identifies and flags the presence of **Personally Identifiable Information (PII)** and **Protected Health Information (PHI)**, ensuring your organization remains compliant with critical data protection regulations.

-   **GDPR Compliance**: Protects personal data by ensuring that sensitive information such as names, email addresses, and phone numbers are handled in accordance with strict regulatory standards.
-   **HIPAA Compliance**: Safeguards protected health information, including patient records, medical diagnoses, and treatment details, from unauthorized access and disclosure.

---

## **2. Core Technology**

Our solution is powered by **IBM's Granite large language models**, which provide state-of-the-art capabilities in both **speech-to-text transcription** and **natural language processing**. This allows for highly accurate, real-time analysis of both audio and text-based data.

---

## **3. Key Features**

-   **Real-Time Violation Detection**: Instantly identifies and flags potential GDPR and HIPAA violations in audio recordings and CSV files.
-   **Automated Task Management**: Seamlessly integrates with **Asana** to automatically create detailed tasks for each detected violation, ensuring swift remediation.
-   **Comprehensive Reporting**: Generates downloadable PDF reports that provide a clear overview of all detected violations, including the specific rules that were breached.
-   **Interactive Dashboard**: A user-friendly React-based dashboard visualizes violation data through interactive charts and detailed tables, offering at-a-glance insights into your compliance status.
-   **Rule Cross-Referencing**: Validates data against pre-loaded GDPR and HIPAA rule sets to ensure a high degree of accuracy in violation detection.

---

## **4. System Architecture**

The application is built on a modern, scalable architecture, with a **FastAPI** backend and a **React** frontend.

**Backend Components:**

1.  **API Endpoints (`main.py`)**:
    *   `POST /api/analyze`: The core endpoint for file analysis. It accepts CSV, PDF, and audio files, extracts the relevant text, and initiates the violation detection process.
    *   `POST /api/generate-report`: Generates a downloadable PDF report based on the detected violations.

2.  **Violation Analysis (`watsonchat.py`)**:
    *   Integrates with **IBM WatsonX AI** using the `ibm-watsonx-ai` library.
    *   Leverages the `ibm/granite-13b-instruct-v2` model to analyze text for GDPR and HIPAA violations.

3.  **Speech-to-Text (`speech.py`)**:
    *   Utilizes the **IBM Watson Speech to Text V1** service to transcribe audio files into text for analysis.

4.  **Asana Integration (`asana_client.py`)**:
    *   Connects to the Asana API to automatically create a new task for each detected violation, streamlining the remediation workflow.

**Frontend Components:**

-   A **React**-based user interface for file uploads and data visualization.
-   Interactive charts and tables to display violation statistics and details.
-   Real-time updates to the dashboard as new data is processed.

---

## **5. Getting Started**

To get the application up and running, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/GraniteRegulate.git
    cd GraniteRegulate
    ```

2.  **Set up the backend:**
    -   Navigate to the `backend` directory.
    -   Create a `.env` file and populate it with your credentials, using `.env.example` as a template.
    -   Install the required dependencies:
        ```bash
        pip install -r requirement.txt
        ```
    -   Run the backend server:
        ```bash
        uvicorn main:app --reload
        ```

3.  **Set up the frontend:**
    -   Navigate to the `frontend` directory.
    -   Install the required dependencies:
        ```bash
        npm install
        ```
    -   Run the frontend development server:
        ```bash
        npm run dev
        ```

---

## **6. Hackathon Showcase**

**GraniteRegulate** is proud to be a part of the **IBM Hackathon**. Our project demonstrates the power of IBM's Granite models in solving real-world compliance challenges, providing a robust, scalable, and highly accurate solution for modern enterprises.
