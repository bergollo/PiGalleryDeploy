from ansible.cli.playbook import PlaybookCLI
from ansible.utils.display import Display

# Create a display object
display = Display()

# Set up the playbook
playbook = PlaybookCLI(
    playbook='playbook.yml',
    inventory='hosts.ini',
    extra_vars={},
    verbosity=3,
    diff=True,
    display=display
)

# Run the playbook
results = playbook.run()

# Print results
print(f"Playbook run completed with status: {results}")
