Yorc - Simple software deployment
=================================

Yorc is a simple tool designed to make software deployment easier.

Usage
-----

Yorc can be used to open interactive and non-interactive shell connections
to remote servers. Connection details for the remote servers are defined in
YAML format target files.

**Example target file: `dev.yaml`**

    # dev.yaml
    host: dev.example.com
    user: joe
    pasword: letmein

With the above target file in the current directory, an interactive shell to
the specified server can be opened with the folowing command:

    $ yorc dev

You can execute commands through a non-interactive shell as follows:

    $ echo 'uptime' | yorc dev

If you have a script file that you would like to execute on the remote server
you can use:

    $ yorc dev < my-script.sh



