'''
This script demonstrates various features of the Cloudflare API using the official Python library.

To use this script, you need to:
1. Install the Cloudflare Python library: pip install cloudflare
2. Set your Cloudflare API token as an environment variable:
   export CLOUDFLARE_API_TOKEN="your_api_token"
3. Set your Account ID as an environment variable:
   export CLOUDFLARE_ACCOUNT_ID="your_account_id"
'''

import os
from cloudflare import Cloudflare

# Initialize the Cloudflare client
# The client automatically uses the CLOUDFLARE_API_TOKEN environment variable for authentication.
client = Cloudflare()

# Get the Account ID from environment variables
account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")

def list_zones():
    """Lists all zones in your Cloudflare account."""
    print("--- Listing Zones ---")
    try:
        zones = client.zones.list()
        for zone in zones:
            print(f"Zone ID: {zone.id}, Name: {zone.name}, Status: {zone.status}")
        return zones[0].id if zones else None
    except Exception as e:
        print(f"Error listing zones: {e}")
        return None

def create_dns_record(zone_id):
    """Creates a new DNS record for a given zone."""
    print("\n--- Creating a DNS Record ---")
    if not zone_id:
        print("Cannot create DNS record without a zone ID.")
        return

    try:
        dns_record = client.dns.records.create(
            zone_id=zone_id,
            data={
                "name": "example.com",
                "type": "A",
                "content": "192.0.2.1",
                "proxied": True,
                "ttl": 1,  # 1 for automatic
            },
        )
        print(f"Successfully created DNS record: {dns_record.id}")
        return dns_record.id
    except Exception as e:
        print(f"Error creating DNS record: {e}")

def list_dns_records(zone_id):
    """Lists all DNS records for a given zone."""
    print("\n--- Listing DNS Records ---")
    if not zone_id:
        print("Cannot list DNS records without a zone ID.")
        return

    try:
        dns_records = client.dns.records.list(zone_id=zone_id)
        for record in dns_records:
            print(f"Record ID: {record.id}, Type: {record.type}, Name: {record.name}, Content: {record.content}")
    except Exception as e:
        print(f"Error listing DNS records: {e}")

def delete_dns_record(zone_id, record_id):
    """Deletes a specific DNS record from a zone."""
    print("\n--- Deleting a DNS Record ---")
    if not zone_id or not record_id:
        print("Cannot delete DNS record without zone and record IDs.")
        return

    try:
        client.dns.records.delete(zone_id=zone_id, dns_record_id=record_id)
        print(f"Successfully deleted DNS record: {record_id}")
    except Exception as e:
        print(f"Error deleting DNS record: {e}")

def main():
    """Main function to run the Cloudflare API demo."""
    if not os.environ.get("CLOUDFLARE_API_TOKEN") or not account_id:
        print("Please set the CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables.")
        return

    print("Starting Cloudflare API Demo...")

    # --- Zone Management ---
    zone_id = list_zones()

    if zone_id:
        # --- DNS Record Management ---
        record_id = create_dns_record(zone_id)
        list_dns_records(zone_id)
        if record_id:
            delete_dns_record(zone_id, record_id)

if __name__ == "__main__":
    main()
