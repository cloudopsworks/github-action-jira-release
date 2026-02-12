import { context } from '@actions/github'
import * as core from '@actions/core'

import setFixVersion from './jira-issues-updater'
import jiraClient from './jira-client'

async function run() {
  try {
    const { tag_name, name } = context.payload.release

    let jiraVersionName = `${context.repo.repo}-${tag_name.replace(/^v/, '')}`

    const cloud_id = core.getInput('cloud_id')
    // Print output
    core.info(`Cloud ID: ${cloud_id}`)
    let restString = ''
    if (cloud_id === '') {
      restString = 'rest/api/3/version'
    } else {
      restString = `ex/jira/${cloud_id}/rest/api/3/version`
    }

    const data = await jiraClient
      .post(restString, {
        json: {
          name: jiraVersionName,
          projectId: parseInt(core.getInput('project_id')),
          description: name,
        },
      })
      .json()

    core.setOutput('jira_release_id', data ? data.id : '???')
    core.setOutput('jira_release_name', data ? data.name : '???')

    await setFixVersion(data.name)
  } catch (e) {
    console.error('Error', e)
    core.setFailed(e.toString())
  }
}

run()
