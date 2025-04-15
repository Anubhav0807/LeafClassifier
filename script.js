const apiUrl = "https://leaf-description.vercel.app/leaf";

// Fetch list of leaves
async function getLeaves() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.available_leaves;
    } catch (error) {
        console.error("Error fetching leaves:", error);
        return null;
    }
}

// Fetch description of a specific leaf
async function describe(leaf) {
    try {
        const response = await fetch(`${apiUrl}/${leaf}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching leaf:", error);
        return null;
    }
}
