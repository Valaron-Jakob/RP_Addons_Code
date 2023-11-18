const ITEM_ADDON_FOLDER = DriveApp.getFolderById('1qbDHt4vQ1bODS4C7ij4FABCy3VL-hgT2')

// creates a menu bar when opened
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Texturepack')
            .addItem('Generate Optifine Folder', 'generateOptifineFolder')
            .addItem('Generate Properties', 'generateProperties')
            .addToUi()
}

// input for every item that should be inside this
function itemSelection(ui) {
    const PROMT_HEADER = "Select Items:"
    const PROMT_TEXT = "Choose items to be exported (Copy values from first row): [A1 A2]"
    const PROMT_BUTTON_SET = ui.ButtonSet.OK_CANCEL

    return ui.prompt( PROMT_HEADER, PROMT_TEXT, PROMT_BUTTON_SET )
}

// creates a new folder inside the main addon folder
function createOutputFolder(folder_prefix) {
    const formatted_date = Utilities.formatDate(new Date(), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yy_MM_dd")

    return DriveApp.getFolderById(ITEM_ADDON_FOLDER.createFolder(`${folder_prefix}_${formatted_date}`).getId())
}

// generates a whole folder containing every file on the right position
function generateOptifineFolder() {
    const ui = SpreadsheetApp.getUi()
    const promt_output = itemSelection(ui)

    if (promt_output.getSelectedButton() == ui.Button.CANCEL) return

    // creates a new OptiFine_<date> folder inside the main addon folder
    const new_optifine_folder = createOutputFolder('OptiFine')
    const new_cit_folder = DriveApp.getFolderById(new_optifine_folder.createFolder("cit").getId())

    // gets the correct values for every input row
    const current_sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    const row_list = promt_output.getResponseText().split(" ")

    for ( var row in row_list ) {
        const current_range = current_sheet.getRange(row_list[row] + ":" + row_list[row]).getValues()
        var output_folder = new_cit_folder

        // creates the correct folders if missing
        const type_name = current_range[0][6]

        if (type_name != '') {
            if (new_cit_folder.getFoldersByName(type_name).hasNext() == false) {
                output_folder = DriveApp.getFolderById(new_cit_folder.createFolder(type_name).getId())
            }
            else {
                output_folder = new_cit_folder.getFoldersByName(type_name).next()
            }
        }

        const folder_name = current_range[0][5]

        if (folder_name != '') {
            if (folder.getFoldersByName(folder_name).hasNext() == false) {
                output_folder = DriveApp.getFolderById(folder.createFolder(folder_name).getId())
            }
            else {
                output_folder = folder.getFoldersByName(folder_name).next()
            }
        }
        
        // creates a new <name>.properties file inside the correct folder
        const item_name = current_range[0][2]
        output_folder.createFile(`${item_name}.properties`, createPropertiesString(current_range[0]))
    }
}

// generates a new folder containing every properties file
function generateProperties() {
    
    const ui = SpreadsheetApp.getUi()
    const promt_output = itemSelection(ui)

    if (promt_output.getSelectedButton() == ui.Button.CANCEL) return

    // creates a new Properties_<date> folder inside the main addon folder
    const new_properties_folder = createOutputFolder('Properties')

    // gets the correct values for every input row
    const current_sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    const row_list = promt_output.getResponseText().split(" ")

    for ( var row in row_list ) {
        const current_range = current_sheet.getRange(row_list[row] + ":" + row_list[row]).getValues()

        const item_name = current_range[0][2]
        output_folder.createFile(`${item_name}.properties`, createPropertiesString(current_range[0]))
    }
}

// formatting function for the .properties
function createPropertiesString(row_array) {
    var output_string = []

    const items      = row_array[1]
    const name_en    = row_array[3]
    const name_de    = row_array[4]
    const weight     = row_array[7]
    const folder     = row_array[5]
    const sub_folder = row_array[6]
    const file_name  = row_array[2]
    const model      = row_array[8]

    if (sub_folder != '') {
        var texture_path = `optifine/cit/textures/${folder}/${sub_folder}`
    } else {
        var texture_path = `optifine/cit/textures/${folder}`
    }
    const model_path = `optifine/cit/models/items`

    const additional = row_array[9]
                            .replace(/\[texture_path\]/g, `${texture_path}/${file_name}`)
                            .replace(/\[model_path\]/g, `${model_path}`)

    output_string.push(`items=${items}`)
    output_string.push(`nbt.display.Name=iregex:${buildMatcher(name_en, name_de)}`)
    output_string.push(`weight=${weight}`)
    output_string.push(`texture=${texture_path}/${file_name}`)

    if (model      != '') output_string.push(`model=${model_path}/${model}`)
    if (additional != '') output_string.push(`${additional}`)

    return output_string.join('\n')
}

// build the default matcher for name matching
function buildMatcher(name_en, name_de) {
    return `(.* |^)(${name_en}|${name_de})( .*|$)`
        .replace(/Ü/g, '\\\\u00DC')
        .replace(/Ä/g, '\\\\u00C4')
        .replace(/Ö/g, '\\\\u00D6')
        .replace(/ü/g, '\\\\u00FC')
        .replace(/ä/g, '\\\\u00E4')
        .replace(/ö/g, '\\\\u00F6')
        .replace(/ß/g, '\\\\u00DF')
}



