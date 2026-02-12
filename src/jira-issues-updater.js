/**
 * Jira issues updater.
 *
 * Loops over all tickets in Jira and updates field "Fix Versions" with the current $jiraVersion value
 */

import getJiraTicketsFromCommits from './github-api-client'
import jiraClient from './jira-client'
import * as core from '@actions/core'

async function updateJiraTickets(tickets, jiraVersion) {
  const promises = tickets.map(async (t) => {
    const cloud_id = core.getInput('cloud_id')
    // Print output
    console.log(`Cloud ID: ${cloud_id}`)
    console.log(`Updating ticket ${t} with version ${jiraVersion}`)
    // check if domain contains api.atlassian.com
    let restString = ''
    if ( cloud_id === '' ) {
      restString = `rest/api/3/issue/${t}`
    } else {
      restString = `ex/jira/${cloud_id}/rest/api/3/issue/${t}`
    }
    try {
      const response = await jiraClient
        .put(restString, {
          json: {
            update: {
              fixVersions: [
                {
                  add: { name: jiraVersion },
                },
              ],
            },
          },
        })
        .json()

      return response
    } catch (error) {
      console.error(
        `Failed to update issue ${t}:`,
        error.response?.body || error
      )
      throw error
    }
  })

  return await Promise.all(promises)
}

async function setFixVersion(jiraVersion) {
  return getJiraTicketsFromCommits()
    .then((t) => updateJiraTickets(t, jiraVersion))
    .catch((e) => console.error(e))
    .then(() => console.info('Done!'))
}

export default setFixVersion
