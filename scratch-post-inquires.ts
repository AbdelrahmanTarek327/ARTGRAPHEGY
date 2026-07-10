async function run() {
  const payload = {
    name: "Jane Smith",
    company: "Creative Designs",
    projectType: "fitout",
    description: "Looking for a high-end commercial office fit-out with custom joinery.",
    email: "jane@creativedesigns.com"
  };
  try {
    const response = await fetch("http://localhost:3002/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response body:", data);
  } catch (error) {
    console.error("Request failed:", error);
  }
}
run();