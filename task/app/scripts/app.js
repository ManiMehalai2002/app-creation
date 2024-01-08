let client;
let user;
let token;
let repo;

init();

async function init() {
  client = await app.initialized();
  await convert();

  let button = document.getElementById("btn");
  button.addEventListener("click", createGitHubIssue);
}

async function convert() {
  try {
    let data = await client.iparams.get();
    user = data.name;
    token = data.token;
    repo = data.repo;
  } catch (error) {
    console.error('Error getting integration parameters:', error);
  }
}

async function getTicketDetails() {
  try {
    const data = await client.data.get("ticket");
    return data.ticket;
  } catch (error) {
    console.error('Error getting ticket details:', error);
    throw error;
  }
}



async function createGitHubIssue() {
  try {
    const ticketDetails = await getTicketDetails();

    const owner = user;
    const repoName = repo;
    const accessToken = token;

    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/issues`;

    const issueData = {
      title: ticketDetails.subject,
      body: `Freshdesk Ticket: ${ticketDetails.id}\n\n${ticketDetails.description || 'No description provided'}`,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${accessToken}`,
      },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create issue: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.json();
  
    console.log('GitHub Issue created successfully:', responseData);
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
  }
}
