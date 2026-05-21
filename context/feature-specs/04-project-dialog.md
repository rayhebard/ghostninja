## Goal

Build the `editor` home screen and add project dialogs/sidebar actions. No API call or persistence yet.

## Editor home

Reuse the existing editor layout. Do not modify the navbar or sidebar behavior.

In the center of the page, add:

- heading: `Create a project or open an existing one`
- description: `Start a new architect workspace, or choose a project from the sidebar`
- `New Project` button with a `Plus` icon

Keep the layout minimal. Do not wrap content in cards.

Clicking `New Project`  should open the Create Project Dialog
## Dialogs

### Create Project

- project name input
- live slug preview based on the name
- preview updates as the user types

### Rename project

- prefilled project name input
- current project name shown in the description
- input auto-focuses
- Enter submits

### Delete Project

- destructive confirmation only
- no input
- confirm button uses destructive styling

## Sidebar

Add project item actions:

- rename
- delete

Show actions only for owned projects.

Hide actions for shared/collaborator projects. 

On mobile:

- tapping outside the sidebar closes it 
- add a backdrop scrim

## Implementation

Create a dedicated hook to manage:

- dialog state
- form state
- loading state

Wire: 

- editor home `New Project` -> Create dialog
- sidebar create -> Create dialog
- sidebar rename -> Rename dialog
- sidebar delete -> Delete dialog

Use mock project data only. Do not add API calls or persistence.

## Check when done

- sidebar actions are wired 
- slug preview works 
- no Typescript errors
- no lint errors 

