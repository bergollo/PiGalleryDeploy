import ansible_runner

# Run the playbook
result = ansible_runner.run(
    private_data_dir='hosts.ini',
    playbook='playbook.yml'
)

# Print the result
print(f"Status: {result.status}")
print(f"RC: {result.rc}")
print("Events:")
for event in result.events:
    print(event)