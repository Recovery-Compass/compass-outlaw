#!/usr/bin/env python3
"""
Perplexity API Demo Script
===========================
This script demonstrates various features and capabilities of the Perplexity API,
including different models, search modes, filtering options, and response formats.

Requirements:
    pip install requests

Environment Variables:
    SONAR_API_KEY: Your Perplexity API key
"""

import os
import json
import requests
from typing import Dict, List, Any, Optional


class PerplexityAPIDemo:
    """Demonstrates Perplexity API capabilities with various examples."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the demo with API credentials.
        
        Args:
            api_key: Perplexity API key (defaults to SONAR_API_KEY env var)
        """
        self.api_key = api_key or os.getenv('SONAR_API_KEY')
        if not self.api_key:
            raise ValueError("API key required. Set SONAR_API_KEY environment variable or pass api_key parameter.")
        
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _make_request(self, payload: Dict[str, Any], stream: bool = False) -> Dict[str, Any]:
        """
        Make a request to the Perplexity API.
        
        Args:
            payload: Request payload
            stream: Whether to stream the response
            
        Returns:
            API response as dictionary
        """
        try:
            if stream:
                response = requests.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    stream=True
                )
                response.raise_for_status()
                return response
            else:
                response = requests.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making request: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            raise
    
    def _print_section(self, title: str):
        """Print a formatted section header."""
        print("\n" + "=" * 80)
        print(f"  {title}")
        print("=" * 80 + "\n")
    
    def _print_response(self, response: Dict[str, Any], show_full: bool = False):
        """
        Print formatted API response.
        
        Args:
            response: API response dictionary
            show_full: Whether to show full JSON response
        """
        # Extract main content
        content = response.get('choices', [{}])[0].get('message', {}).get('content', '')
        print("Response Content:")
        print("-" * 80)
        print(content)
        print("-" * 80)
        
        # Show citations if available
        if 'citations' in response:
            print("\nCitations:")
            for i, citation in enumerate(response['citations'], 1):
                print(f"  [{i}] {citation}")
        
        # Show search results if available
        if 'search_results' in response and response['search_results']:
            print("\nSearch Results (first 3):")
            for result in response['search_results'][:3]:
                print(f"  - {result.get('title', 'N/A')}")
                print(f"    URL: {result.get('url', 'N/A')}")
                print(f"    Date: {result.get('date', 'N/A')}")
        
        # Show usage information
        if 'usage' in response:
            usage = response['usage']
            print("\nUsage Information:")
            print(f"  Prompt tokens: {usage.get('prompt_tokens', 0)}")
            print(f"  Completion tokens: {usage.get('completion_tokens', 0)}")
            print(f"  Total tokens: {usage.get('total_tokens', 0)}")
            if 'cost' in usage:
                cost = usage['cost']
                print(f"  Total cost: ${cost.get('total_cost', 0):.4f}")
        
        # Show full response if requested
        if show_full:
            print("\nFull JSON Response:")
            print(json.dumps(response, indent=2))
    
    def demo_basic_query(self):
        """Demonstrate basic query with sonar-pro model."""
        self._print_section("Demo 1: Basic Query with Sonar Pro")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "What are the latest developments in quantum computing in 2025?"
                }
            ]
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_with_system_prompt(self):
        """Demonstrate using system prompts for response control."""
        self._print_section("Demo 2: Using System Prompts")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a technical expert. Provide concise, bullet-pointed answers."
                },
                {
                    "role": "user",
                    "content": "Explain the benefits of using AI APIs in modern applications."
                }
            ],
            "temperature": 0.3
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_search_modes(self):
        """Demonstrate different search modes (web, academic, sec)."""
        self._print_section("Demo 3: Academic Search Mode")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "What are the latest research findings on CRISPR gene editing?"
                }
            ],
            "search_mode": "academic"
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_time_filtering(self):
        """Demonstrate time-based filtering of search results."""
        self._print_section("Demo 4: Time-Based Filtering")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "What are the major tech announcements this week?"
                }
            ],
            "search_recency_filter": "week"
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_domain_filtering(self):
        """Demonstrate domain filtering (allowlist/denylist)."""
        self._print_section("Demo 5: Domain Filtering")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "What are the latest AI developments?"
                }
            ],
            "search_domain_filter": [
                "arxiv.org",
                "openai.com",
                "anthropic.com",
                "deepmind.google"
            ]
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_with_images(self):
        """Demonstrate returning images in search results."""
        self._print_section("Demo 6: Search with Images")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "Show me information about the James Webb Space Telescope discoveries."
                }
            ],
            "return_images": True,
            "return_related_questions": True
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
        
        # Show images if available
        if 'images' in response and response['images']:
            print("\nImages Found:")
            for i, img in enumerate(response['images'][:3], 1):
                print(f"  [{i}] {img}")
    
    def demo_streaming_response(self):
        """Demonstrate streaming responses."""
        self._print_section("Demo 7: Streaming Response")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "Explain how neural networks work in simple terms."
                }
            ],
            "stream": True
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nStreaming response...")
        print("-" * 80)
        
        response = self._make_request(payload, stream=True)
        
        full_content = ""
        for line in response.iter_lines():
            if line:
                line_text = line.decode('utf-8')
                if line_text.startswith('data: '):
                    data_str = line_text[6:]
                    if data_str.strip() == '[DONE]':
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data.get('choices', [{}])[0].get('delta', {})
                        content = delta.get('content', '')
                        if content:
                            print(content, end='', flush=True)
                            full_content += content
                    except json.JSONDecodeError:
                        continue
        
        print("\n" + "-" * 80)
        print(f"\nTotal characters streamed: {len(full_content)}")
    
    def demo_reasoning_model(self):
        """Demonstrate reasoning model for complex tasks."""
        self._print_section("Demo 8: Reasoning Model")
        
        payload = {
            "model": "sonar-reasoning",
            "messages": [
                {
                    "role": "user",
                    "content": "Compare the pros and cons of different cloud providers (AWS, Azure, GCP) for a startup building an AI application."
                }
            ]
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_disable_search(self):
        """Demonstrate disabling web search to use only training data."""
        self._print_section("Demo 9: Disable Web Search")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "What is machine learning?"
                }
            ],
            "disable_search": True
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def demo_conversation_history(self):
        """Demonstrate multi-turn conversation with context."""
        self._print_section("Demo 10: Multi-Turn Conversation")
        
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": "What is the capital of France?"
                },
                {
                    "role": "assistant",
                    "content": "The capital of France is Paris."
                },
                {
                    "role": "user",
                    "content": "What are the top tourist attractions there?"
                }
            ]
        }
        
        print("Request:")
        print(json.dumps(payload, indent=2))
        print("\nMaking request...")
        
        response = self._make_request(payload)
        self._print_response(response)
    
    def run_all_demos(self):
        """Run all demonstration examples."""
        print("\n" + "=" * 80)
        print("  PERPLEXITY API COMPREHENSIVE DEMO")
        print("=" * 80)
        
        demos = [
            self.demo_basic_query,
            self.demo_with_system_prompt,
            self.demo_search_modes,
            self.demo_time_filtering,
            self.demo_domain_filtering,
            self.demo_with_images,
            self.demo_streaming_response,
            self.demo_reasoning_model,
            self.demo_disable_search,
            self.demo_conversation_history
        ]
        
        for i, demo in enumerate(demos, 1):
            try:
                demo()
                if i < len(demos):
                    input("\nPress Enter to continue to next demo...")
            except Exception as e:
                print(f"\nError in demo: {e}")
                continue
        
        print("\n" + "=" * 80)
        print("  ALL DEMOS COMPLETED")
        print("=" * 80)


def main():
    """Main entry point for the demo script."""
    print("Perplexity API Demo Script")
    print("=" * 80)
    
    # Check for API key
    api_key = os.getenv('SONAR_API_KEY')
    if not api_key:
        print("\nError: SONAR_API_KEY environment variable not set.")
        print("Please set it with: export SONAR_API_KEY='your_api_key_here'")
        return
    
    # Create demo instance
    demo = PerplexityAPIDemo(api_key)
    
    # Menu
    print("\nAvailable demos:")
    print("  1. Basic Query")
    print("  2. System Prompts")
    print("  3. Academic Search Mode")
    print("  4. Time-Based Filtering")
    print("  5. Domain Filtering")
    print("  6. Search with Images")
    print("  7. Streaming Response")
    print("  8. Reasoning Model")
    print("  9. Disable Web Search")
    print(" 10. Multi-Turn Conversation")
    print("  0. Run All Demos")
    
    choice = input("\nSelect demo number (0-10): ").strip()
    
    demo_map = {
        '1': demo.demo_basic_query,
        '2': demo.demo_with_system_prompt,
        '3': demo.demo_search_modes,
        '4': demo.demo_time_filtering,
        '5': demo.demo_domain_filtering,
        '6': demo.demo_with_images,
        '7': demo.demo_streaming_response,
        '8': demo.demo_reasoning_model,
        '9': demo.demo_disable_search,
        '10': demo.demo_conversation_history,
        '0': demo.run_all_demos
    }
    
    if choice in demo_map:
        demo_map[choice]()
    else:
        print("Invalid choice. Please run again and select 0-10.")


if __name__ == "__main__":
    main()
