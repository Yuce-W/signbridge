import React from 'react';
import { Link } from 'react-router-dom';
import WarningBanner from '../components/WarningBanner.jsx';

export default function About() {
  return (
    <div className="prose-page">
      <WarningBanner />

      <header className="page-header">
        <div className="eyebrow">ABOUT & SAFETY PROTOCOLS</div>
        <h1>Communication Support with Strict Clinical Boundaries</h1>
      </header>

      <h2>Current Prototype Capabilities vs Limitations</h2>
      <p>
        SignBridge is an exploratory research prototype investigating how visual interfaces and on-device computer vision landmarks might one day assist simple communication in clinical settings.
      </p>
      <ul>
        <li>
          <strong>What works today:</strong> Manual phrase selection, interactive speech synthesis (with mandatory user confirmation), and client-side hand landmark tracking via MediaPipe.
        </li>
        <li>
          <strong>What is in development / not available:</strong> Automatic Indian Sign Language (ISL) recognition is <strong>in development</strong> and is not operational for clinical care. Verified ISL demonstration videos for hospital staff are currently not available.
        </li>
      </ul>

      <h2>Strict Prohibition Against High-Stakes Use</h2>
      <p>
        Under healthcare accessibility standards and clinical governance guidelines, SignBridge must <strong>never</strong> be used for:
      </p>
      <ul>
        <li>Emergency medical assessment or acute triage</li>
        <li>Obtaining informed consent for medical, surgical, or invasive procedures</li>
        <li>Delivering clinical diagnoses, prognoses, or test results</li>
        <li>Prescribing, adjusting, or administering medications and dosages</li>
        <li>Patient discharge instructions or critical post-operative care</li>
      </ul>
      <p>
        Whenever high-stakes communication is required, healthcare providers are ethically and legally obligated to arrange a certified in-person Indian Sign Language interpreter or certified Video Remote Interpreting (VRI) service.{' '}
        <Link to="/interpreter" style={{ color: '#5eead4', fontWeight: 'bold', textDecoration: 'underline' }}>
          See Interpreter Request Protocols →
        </Link>
      </p>

      <h2>Client-Side Privacy Architecture</h2>
      <p>
        SignBridge is built with on-device privacy safeguards:
      </p>
      <ul>
        <li>
          <strong>Browser-local analysis:</strong> Webcam video is processed directly inside your browser using WebAssembly.
        </li>
        <li>
          <strong>No video streaming or recording:</strong> Camera frames are analyzed in temporary memory and are never uploaded, streamed to cloud servers, or persisted to disk.
        </li>
        <li>
          <strong>Explicit permission:</strong> Camera access is only requested when you explicitly click "Start camera" and all media hardware tracks are immediately stopped when you select "Stop camera" or navigate away.
        </li>
        <li>
          <strong>Research Dataset Studio:</strong> Collects numerical coordinates only (x, y, z joint numbers) in temporary browser session memory for consenting volunteers. No video files or patient health records are collected.
        </li>
      </ul>

      <h2>Mandatory Human-in-the-Loop Confirmation</h2>
      <p>
        To prevent miscommunication, SignBridge implements a strict confirmation requirement. No message is ever spoken or submitted automatically. The patient or user must always review the candidate text on screen and select <em>"Yes, confirm"</em> before text-to-speech audio is played.
      </p>

      <h2>Prerequisites for Future Clinical Readiness</h2>
      <p>
        Before any sign recognition technology can be responsibly considered for operational healthcare settings, the following prerequisites must be met:
      </p>
      <ol>
        <li>Direct co-design, governance, and validation by the Deaf community and certified ISL educators.</li>
        <li>Large-scale, diverse training corpora featuring multiple fluent signers across diverse demographics.</li>
        <li>Rigorous held-out signer evaluation demonstrating verified reliability across varied lighting, angles, and skin tones.</li>
        <li>Formal clinical trial validation and medical regulatory clearance.</li>
      </ol>

      <div className="soft-note" style={{ marginTop: '36px' }}>
        <strong>Need an interpreter now?</strong> If you are a patient, family member, or healthcare worker needing communication support, visit our{' '}
        <Link to="/interpreter" style={{ color: '#5eead4', fontWeight: 'bold' }}>
          Interpreter & Support Resources page
        </Link>{' '}
        for hospital on-call protocols and national directories.
      </div>
    </div>
  );
}
