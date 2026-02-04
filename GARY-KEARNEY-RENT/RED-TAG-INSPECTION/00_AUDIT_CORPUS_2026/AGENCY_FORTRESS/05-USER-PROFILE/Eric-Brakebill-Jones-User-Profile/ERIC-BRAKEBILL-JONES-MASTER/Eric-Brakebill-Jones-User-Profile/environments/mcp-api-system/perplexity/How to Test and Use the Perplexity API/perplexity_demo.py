#!/usr/bin/env python3
"""
Comprehensive demo script for the Perplexity API, showcasing various features.

To run this script:
1. Make sure you have Python 3 installed.
2. Install the requests library: pip install requests
3. Set your Perplexity API key as an environment variable:
   export SONAR_API_KEY=\"your_api_key_here\"
4. Run the script: python3 perplexity_demo.py
"""

import os
import requests
import json

# --- Configuration ---
API_KEY = os.environ.get("SONAR_API_KEY")
API_URL = "https://api.perplexity.ai/chat/completions"

# --- Helper Functions ---

def print_header(title):
    """Prints a formatted header for each demo section."""
    print("\n" + "=" * 70)
    print(f"| {title.center(66)} |")
    print("=" * 70)

def make_request(payload, stream=False):
    """Makes a request to the Perplexity API and handles the response."""
    if not API_KEY:
        print("\n\[Error] SONAR_API_KEY environment variable not set.")
        return None

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, stream=stream)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"\n\[Error] API request failed: {e}")
        if e.response is not None:
            print(f"Response Body: {e.response.text}")
        return None

def print_response_details(data):
    """Prints common details from a non-streaming API response."""
    print(f"\nModel: {data.get("model")}")
    print("\n[AI Response]")
    print(data["choices"][0]["message"]["content"])

    if "citations" in data and data["citations"]:
        print("\n[Citations]")
        for i, citation in enumerate(data["citations"][:3], 1):
            print(f"  {i}. {citation}")

    if "search_results" in data and data["search_results"]:
        print("\n[Search Results]")
        for i, result in enumerate(data["search_results"][:2], 1):
            print(f"  - {result.get("title", "N/A")} ({result.get("url", "N/A")})")

    if "usage" in data:
        usage = data["usage"]
        cost = usage.get("cost", {})
        print("\n[Usage & Cost]")
        print(f"  - Prompt Tokens: {usage.get("prompt_tokens")}")
        print(f"  - Completion Tokens: {usage.get("completion_tokens")}")
        print(f"  - Total Tokens: {usage.get("total_tokens")}")
        print(f"  - Request Cost: ${cost.get("request_cost", 0):.5f}")
        print(f"  - Total Cost: ${cost.get("total_cost", 0):.5f}")

# --- Demo Functions ---

def demo_basic_request():
    """1. Basic non-streaming request with the default sonar model."""
    print_header("1. Basic Non-Streaming Request")
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "What are the main benefits of using Python?"}
        ]
    }
    response = make_request(payload)
    if response:
        print_response_details(response.json())

def demo_streaming_request():
    """2. Streaming request to receive the response incrementally."""
    print_header("2. Streaming Request")
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "Explain the theory of relativity in simple terms."}
        ],
        "stream": True
    }
    response = make_request(payload, stream=True)
    if response:
        print("\n[Streaming AI Response]")
        full_content = ""
        for line in response.iter_lines():
            if line:
                line_text = line.decode("utf-8")
                if line_text.startswith("data: "):
                    data_str = line_text[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0].get("delta", {})
                        if "content" in delta:
                            content = delta["content"]
                            print(content, end="", flush=True)
                            full_content += content
                    except json.JSONDecodeError:
                        continue
        print()

def demo_advanced_search():
    """3. Using sonar-pro for more advanced search and richer results."""
    print_header("3. Advanced Search with sonar-pro")
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": "Summarize the latest advancements in renewable energy technology in 2025."}
        ]
    }
    response = make_request(payload)
    if response:
        print_response_details(response.json())

def demo_deep_research():
    """4. Using sonar-deep-research for in-depth reports."""
    print_header("4. Deep Research with sonar-deep-research")
    payload = {
        "model": "sonar-deep-research",
        "messages": [
            {"role": "user", "content": "Provide a detailed market analysis of the global electric vehicle market, including key players, growth drivers, and future trends."}
        ],
        "reasoning_effort": "low" # Use "low" to conserve tokens for this demo
    }
    response = make_request(payload)
    if response:
        print_response_details(response.json())

def demo_search_filtering():
    """5. Filtering search results by domain and mode."""
    print_header("5. Search Filtering (Academic Search)")
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": "What are the latest findings on the effects of meditation on the brain?"}
        ],
        "search_mode": "academic",
        "search_domain_filter": ["nature.com", "cell.com"]
    }
    response = make_request(payload)
    if response:
        print("\nRequesting from academic sources, specifically nature.com and cell.com...")
        print_response_details(response.json())

def demo_disable_search():
    """6. Disabling web search to rely only on the model's internal knowledge."""
    print_header("6. Disabling Web Search")
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "Write a short poem about the ocean."}
        ],
        "disable_search": True
    }
    response = make_request(payload)
    if response:
        print("\nWeb search is disabled. The model will generate a creative response.")
        print_response_details(response.json())

def demo_response_control():
    """7. Controlling the response with temperature and max_tokens."""
    print_header("7. Response Control (Creative & Concise)")
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": "Suggest three creative names for a new coffee shop."}
        ],
        "temperature": 1.2, # Higher temperature for more creativity
        "max_tokens": 50      # Limit the response length
    }
    response = make_request(payload)
    if response:
        print("\nRequesting a creative and concise response...")
        print_response_details(response.json())

# --- Main Execution ---
if __name__ == "__main__":
    print_header("Perplexity API Demo Script")
    print("This script demonstrates key features of the Perplexity API.")

    # Run the demo functions
    demo_basic_request()
    demo_streaming_request()
    demo_advanced_search()
    demo_deep_research()
    demo_search_filtering()
    demo_disable_search()
    demo_response_control()

    print_header("Demo Complete")
