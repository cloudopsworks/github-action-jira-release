import { context } from '@actions/github'
import * as core from '@actions/core'

import setFixVersion from './jira-issues-updater'
import jiraClient from './jira-client'
import JiraConfig from './config.js'

async function run() {
  try {
    const { tag_name, name } = context.payload.release

    let jiraVersionName = `${context.repo.repo}-${tag_name.replace(/^v/, '')}`

    const domain = JiraConfig.JiraDomain
    // check if domain contains api.atlassian.com
    var restString = 'rest/api/3/version'
    if ( domain.indexOd('api.atlassian.com') !== -1 ) {
      const cloud_id = core.getInput('cloud_id')
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
