const data = {
    acls: [],
    tags: {},
    hosts: {},
    groups: {}
};

// Handle dropdown selection change
document.getElementById('item-type').addEventListener('change', function () {
    const itemType = this.value;
    const dynamicForm = document.getElementById('dynamic-form');
    dynamicForm.innerHTML = ""; // Clear previous form

    if (!itemType) return;

    if (itemType === "acl") {
        dynamicForm.innerHTML = `
            <div class="form-group">
                <label for="proto">Protocol</label>
                <select id="proto" onchange="handleProtocolChange()">
                    <option value="" selected>No Protocol (Optional)</option>
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="sctp">SCTP</option>
                    <option value="igmp">IGMP</option>
                    <option value="ipv4">IPv4</option>
                    <option value="egp">EGP</option>
                    <option value="igp">IGP</option>
                    <option value="gre">GRE</option>
                    <option value="esp">ESP</option>
                    <option value="ah">AH</option>
                </select>
            </div>

            <div class="form-group" id="port-group">
                <label for="port">Port</label>
                <select id="port" onchange="handleCustomInput('port', 'custom-port')">
                    <option value="80">HTTP (80)</option>
                    <option value="443">HTTPS (443)</option>
                    <option value="22">SSH (22)</option>
                    <option value="*">Any (*)</option>
                    <option value="">Custom</option>
                </select>
                <input type="text" id="custom-port" class="conditional-input" placeholder="Enter Custom Port">
            </div>

            <div class="form-group">
                <label for="source">Source</label>
                <select id="source-type" onchange="handleCustomSourceInput()">
                    <option value="*">Any</option>
                    <option value="user">User</option>
                    <option value="group">Group</option>
                    <option value="ip">Tailscale IP</option>
                    <option value="subnet">Subnet CIDR</option>
                    <option value="host">Host</option>
                    <option value="tag">Tag</option>
                    <option value="autogroup">Autogroup</option>
                </select>
                <input type="text" id="custom-source" class="conditional-input" placeholder="Enter Source Value">
            </div>

            <div class="form-group">
                <label for="destination">Destination</label>
                <select id="destination-type" onchange="handleCustomDestinationInput()">
                    <option value="*">Any</option>
                    <option value="user">User</option>
                    <option value="group">Group</option>
                    <option value="ip">Tailscale IP</option>
                    <option value="subnet">Subnet CIDR</option>
                    <option value="host">Host</option>
                    <option value="tag">Tag</option>
                    <option value="autogroup">Autogroup</option>
                </select>
                <input type="text" id="custom-destination" class="conditional-input" placeholder="Enter Destination Value">
            </div>

            <div class="form-group">
                <button id="add-acl">Add ACL</button>
            </div>
        `;
        attachAddAclHandler();
    } else if (itemType === "host") {
        dynamicForm.innerHTML = `
            <div class="form-group">
                <label for="host-name">Host Name</label>
                <input type="text" id="host-name" placeholder="Enter Host Name">
            </div>
            <div class="form-group">
                <label for="host-ip">IP Address</label>
                <input type="text" id="host-ip" placeholder="Enter IP Address">
            </div>
            <div class="form-group">
                <button id="add-host">Add Host</button>
            </div>
        `;
        attachAddHostHandler();
    } else if (itemType === "tag") {
        dynamicForm.innerHTML = `
            <div class="form-group">
                <label for="tag-name">Tag Name</label>
                <input type="text" id="tag-name" placeholder="Enter Tag Name">
            </div>
            <div class="form-group">
                <label for="tag-owners">Owners</label>
                <input type="text" id="tag-owners" placeholder="Enter Owners (comma-separated)">
                <p> <i>only tag:name, group:name, role autogroups, or user@domain are allowed </p>
            </div>
            <div class="form-group">
                <button id="add-tag">Add Tag</button>
            </div>
        `;
        attachAddTagHandler();
    } else if (itemType === "group") {
        dynamicForm.innerHTML = `
            <div class="form-group">
                <label for="group-name">Group Name</label>
                <input type="text" id="group-name" placeholder="Enter Group Name">
            </div>
            <div class="form-group">
                <label for="group-users">Users</label>
                <input type="text" id="group-users" placeholder="Enter Users (comma-separated)">
                
            </div>
            <div class="form-group">
                <button id="add-group">Add Group</button>
            </div>
        `;
        attachAddGroupHandler();
    }
});

function attachAddAclHandler() {
    document.getElementById('add-acl').addEventListener('click', function () {
        const proto = document.getElementById('proto').value || undefined; // Optional
        const port = document.getElementById('custom-port').value || document.getElementById('port').value;
        const source = document.getElementById('custom-source').value || document.getElementById('source-type').value;
        const destination = document.getElementById('custom-destination').value || document.getElementById('destination-type').value;

        if (!source || !destination) {
            alert("Please fill out all required fields.");
            return;
        }

        const aclEntry = {
            action: "accept",
            src: [source],
            dst: [`${destination}:${port}`]
        };

        if (proto) {
            aclEntry.proto = proto;
        }

        data.acls.push(aclEntry);
        updateOutput();
    });
}

function attachAddHostHandler() {
    document.getElementById('add-host').addEventListener('click', function () {
        const hostName = document.getElementById('host-name').value;
        const hostIp = document.getElementById('host-ip').value;

        if (!hostName || !hostIp) {
            alert("Please fill out all fields.");
            return;
        }

        data.hosts[hostName] = hostIp;
        updateOutput();
    });
}

function attachAddTagHandler() {
    document.getElementById('add-tag').addEventListener('click', function () {
        const tagName = document.getElementById('tag-name').value;
        const tagOwners = document.getElementById('tag-owners').value.split(",").map(owner => owner.trim());

        if (!tagName || !tagOwners.length) {
            alert("Please fill out all fields.");
            return;
        }

        data.tags[`tag:${tagName}`] = tagOwners;
        updateOutput();
    });
}

function attachAddGroupHandler() {
    document.getElementById('add-group').addEventListener('click', function () {
        const groupName = document.getElementById('group-name').value;
        const groupUsers = document.getElementById('group-users').value.split(",").map(user => user.trim());

        if (!groupName || !groupUsers.length) {
            alert("Please fill out all fields.");
            return;
        }

        data.groups[`group:${groupName}`] = groupUsers;
        updateOutput();
    });
}

function updateOutput() {
    document.getElementById('output').textContent = JSON.stringify(data, null, 4);
}

function handleProtocolChange() {
    const proto = document.getElementById('proto').value;
    const portGroup = document.getElementById('port-group');
    portGroup.style.display = "block"; // Always allow port selection
}

function handleCustomInput(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    input.style.display = select.value === "" ? "block" : "none";
    if (select.value !== "") input.value = ""; // Clear custom input if not selected
}

function handleCustomSourceInput() {
    const sourceType = document.getElementById('source-type').value;
    const customSource = document.getElementById('custom-source');
    customSource.style.display = sourceType === "*" ? "none" : "block";
}

function handleCustomDestinationInput() {
    const destinationType = document.getElementById('destination-type').value;
    const customDestination = document.getElementById('custom-destination');
    customDestination.style.display = destinationType === "*" ? "none" : "block";
}
