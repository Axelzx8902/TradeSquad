import sys
with open('out_py.txt', 'w', encoding='utf-8') as f:
    sys.stdout = f
    sys.stderr = f
    import os
    from dotenv import load_dotenv
    import google.generativeai as genai

    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        print("Available models:")
        try:
            for m in genai.list_models():
                print(m.name, m.supported_generation_methods)
        except Exception as e:
            import traceback
            traceback.print_exc()
