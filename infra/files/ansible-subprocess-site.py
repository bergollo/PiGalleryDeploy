import subprocess

# Define the command to run
command = ['ansible-playbook', '-i', 'hosts.ini', 'playbook.yml']

# Execute the command
result = subprocess.run(command, capture_output=True, text=True)

# Print the output
print("STDOUT:")
print(result.stdout)
print("STDERR:")
print(result.stderr)
