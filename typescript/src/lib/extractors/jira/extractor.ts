import { getAllWorkItemsFromJiraApi } from './api-adapter/main';
import { IJiraSettings, JiraSettings } from './settings'
import { IWorkItem } from '../../core/work-item';

class JiraExtractor {
  private settings: IJiraSettings;
  private statusHook: any;
  private workItems: Array<IWorkItem>;

  constructor(settings: IJiraSettings, statusHook: any = () => {}) {
    if (!settings) {
      throw new Error('No JIRA Settings found. Must provide settings');
    }
    this.settings = settings;
    this.statusHook = statusHook;
  }

  getWorkItems(settings = this.settings, hook = this.statusHook): Promise<any> {
    return new Promise((accept, reject) => {
      getAllWorkItemsFromJiraApi(settings, hook)
      .then(items => {
        this.workItems = items;
        accept(items);
      }).catch(err => {
        reject(err);
      });
    });
  };

  toCSV(workItems = this.workItems, stages = this.settings.Stages, attributes = this.settings.Attributes): string {
    const header = `ID,Link,Name,${stages.join(',')},Type,${Object.keys(attributes).join(',')}`;
    const body = workItems.map(item => item.toCSV()).reduce((res, cur) => `${res + cur}\n`, '');
    const csv = `${header}\n${body}`;
    return csv;
  }

  toSerializedArray(workItems = this.workItems, stages = this.settings.Stages, attributes = this.settings.Attributes): string {
    const header = `["ID","Link","Name",${stages.map(stage => `"${stage}"`).join(',')},"Type",${Object.keys(attributes).map(attribute => `"${attribute}"`).join(',')}]`;
    const body = workItems.map(item => item.toSerializedArray()).reduce((res, cur) => `${res},\n${cur}`, '');
    const serializedData: string = `[${header}${body}]`;
    return serializedData;
  }
};

export {
  JiraExtractor,
  JiraSettings,
};
