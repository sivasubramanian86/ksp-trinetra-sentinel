"""
KSP Trinetra Sentinel v2.0 - Native Gemini Audio Voiceover Generator
Uses Google GenAI SDK (gemini-2.5-flash / native audio modality) to generate audio voiceover
"""


import os
import sys
import asyncio
import wave
from google import genai
from google.genai import types

# Complete Voiceover Script Text for KSP Trinetra Sentinel v2.0
SCRIPT_TEXT = (
    "Law enforcement in rapidly growing metropolitan cities faces a critical bottleneck. "
    "Police incident reports, CCTV license plate feeds, forensic evidence tags, and mobile phone tower dumps exist in fragmented data silos. "
    "When a crime occurs, commanders face delayed patrol dispatches, while ground officers lack instant access to newly enacted Bharatiya Nyaya Sanhita legal procedures.\n\n"
    "Welcome to KSP Trinetra Sentinel version 2.0—an autonomous Law Enforcement Command Center and Decision Support Platform deployed one hundred percent natively on Zoho Catalyst. "
    "Trinetra Sentinel fuses multi-source crime data into a real-time, four-dimensional spatio-temporal operational view—shifting police operations from reactive reporting to proactive predictive dispatch.\n\n"
    "At the heart of Trinetra Sentinel is our Spatio-Temporal Threat Vector Engine. Here on our unified command dashboard, commanders can monitor city-wide police beats in real time "
    "using interactive Leaflet GIS maps, complete with instant toggles for CartoDB Dark Vector and Esri High-Resolution Satellite view. "
    "Watch what happens when we operate our Time Machine Forecast Slider. By processing spatio-temporal crime density with temporal features like day of week and weather, "
    "our Graph Neural Network continuously recalculates normalized beat risk scores up to seventy-two hours into the future. "
    "High-risk red alert polygons expand over Indiranagar and Koramangala, giving police commanders exact checkpoint locations to pre-position Hoysala patrol units before intervention windows close.\n\n"
    "Organized crime syndicates rarely operate within a single locality. To uncover hidden criminal networks, our Spectre Multi-Hop Syndicate Matrix automatically correlates vehicle license plates, "
    "mobile phone IMEIs, mule bank accounts, and CCTV camera logs. Using NetworkX graph algorithms, Trinetra Sentinel calculates betweenness centrality to unmask hidden syndicate bosses coordinating stolen vehicle drops across Bengaluru city boundaries. "
    "Clicking any node instantly opens suspect case histories, linked CCTV video clips, and past FIR filings.\n\n"
    "In the field and property room, evidence triage must be instantaneous. Our Zia Multimodal AI Evidence Canvas automates optical character recognition on CCTV images—parsing vehicle plates in under eight hundred milliseconds. "
    "Forensic officers can scan barcode tags to maintain an immutable chain of custody, perform document OCR on legal deeds, and run automated crime scene ballistics triaging—achieving a ninety-four point two percent striation match score on bullet shell casings. "
    "One click passes evidence telemetry directly to our legal copilot.\n\n"
    "To assist officers on duty, we built NammaRaksha Copilot—a dual-language Kannada and English legal assistant powered natively by Zoho QuickML GLM-4.7-Flash thirty-billion Mixture of Experts model. "
    "As the copilot generates responses in under one point eight seconds, officers can expand our Live Thinking Trace Panel to inspect the step-by-step reasoning logic. "
    "NammaRaksha automatically cross-references legacy IPC codes with Bharatiya Nyaya Sanhita equivalents, presents legal ingredient checklists, and enforces India DPDP Act twenty-twenty-three guidelines "
    "by scrubbing citizen PII and blocking demographic bias via our Article 15 Ethics Interceptor. With one click, officers export court-ready operational briefings to PDF.\n\n"
    "Trinetra Sentinel is built for enterprise scale. Operating one hundred percent serverlessly on Zoho Catalyst, the platform utilizes Advanced I/O parallel functions, Context Cache, Cron automated daily alerts, and a complete twelve-table Data Store ER schema. "
    "Furthermore, with pre-configured Capacitor cross-platform support, the entire application compiles natively into Android APK and iOS IPA packages for patrol officers in the field.\n\n"
    "This is KSP Trinetra Sentinel—empowering Karnataka State Police with proactive, intelligent, and constitutionally compliant AI policing. Thank you."
)

def generate_via_generate_content(client, script_text, output_paths):
    print("Initiating audio generation via Google GenAI native audio model (gemini-2.5-flash)...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=(
                "Please read this law enforcement technology pitch script aloud using a clear, authoritative, and energetic female voice. "
                "Output ONLY the spoken audio matching the script text verbatim. "
                "Do not add any preamble, greeting, or background music. Here is the script:\n\n" + script_text
            ),
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name="Kore"
                        )
                    )
                )
            )
        )

        audio_bytes = None
        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    audio_bytes = part.inline_data.data
                    break

        if not audio_bytes:
            print("Warning: No inline_data audio bytes found in response candidate.")
            return False

        for out_path in output_paths:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "wb") as f:
                f.write(audio_bytes)
            print(f"[OK] SUCCESS: Saved Gemini native audio voiceover to: {out_path}")

        return True
    except Exception as e:
        print(f"Standard generate_content audio generation failed: {e}")
        return False

async def generate_via_live_api(client, script_text, output_paths):
    print("Falling back to Live API WebSocket stream (gemini-live-2.5-flash-native-audio)...")
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="Kore"
                )
            )
        )
    )

    audio_chunks = []
    try:
        async with client.aio.live.connect(model="gemini-live-2.5-flash-native-audio", config=config) as session:
            prompt = (
                "Please read the following script aloud with a clear, professional female voice. "
                "Output only the spoken voiceover verbatim:\n\n" + script_text
            )
            await session.send(input=prompt, end_of_turn=True)

            async for response in session.receive():
                if response.server_content and response.server_content.model_turn:
                    for part in response.server_content.model_turn.parts:
                        if part.inline_data:
                            audio_chunks.append(part.inline_data.data)

                if response.server_content and response.server_content.turn_complete:
                    break

        if not audio_chunks:
            return False

        all_pcm_bytes = b"".join(audio_chunks)

        for out_path in output_paths:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with wave.open(out_path, "wb") as wav_file:
                wav_file.setnchannels(1)      # Mono
                wav_file.setsampwidth(2)      # 16-bit PCM
                wav_file.setframerate(24000)  # 24kHz
                wav_file.writeframes(all_pcm_bytes)
            print(f"[OK] SUCCESS: Saved Gemini Live API PCM audio voiceover to: {out_path}")

        return True
    except Exception as e:
        print(f"Live API audio generation failed: {e}")
        return False

async def main():
    print("====================================================")
    print("KSP Trinetra Sentinel - Native Gemini Audio Generator")
    print("====================================================\n")

    # Output destinations
    output_paths = [
        os.path.abspath("data/ksp_trinetra_sentinel_demo_voiceover.wav"),
        os.path.join(r"C:\Users\USER\.gemini\antigravity-ide\brain\c272266e-0a0b-4a00-967d-38c724f241d4", "ksp_trinetra_sentinel_demo_voiceover.wav")
    ]

    # Initialize Google GenAI client (prefer Vertex AI ADC as established in verda_terra_ai_generate_audio_native.py)
    try:
        print("Initializing Google GenAI Client with Vertex AI (genai-apac-2026-491004 / us-central1)...")
        client = genai.Client(
            vertexai=True,
            project="genai-apac-2026-491004",
            location="us-central1"
        )
    except Exception as e:
        print(f"Vertex AI initialization notice: {e}. Trying default GEMINI_API_KEY environment variable...")
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    # Attempt method 1
    success = generate_via_generate_content(client, SCRIPT_TEXT, output_paths)

    # Fallback to method 2
    if not success:
        print("Retrying via Live API WebSocket stream...")
        success = await generate_via_live_api(client, SCRIPT_TEXT, output_paths)

    if success:
        print("\n[SUCCESS] Audio generation completed successfully!")
    else:
        print("\n[ERROR] Error generating audio voiceover.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
