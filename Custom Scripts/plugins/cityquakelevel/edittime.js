﻿function GetPluginSettings()
{
	return {
		"name":			"City Quake Levels",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"CQLevels",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"<appears at the bottom of the insert object dialog>",
		"author":		"Foolmoron",
		"help url":		"https://github.com/foolmoron",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		0						// uncomment lines to enable flags...
						| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
						| pf_position_aces		// compare/set/get x, y...
					//	| pf_size_aces			// compare/set/get width, height...
					//	| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
					//	| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
					//	| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
					//	| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				
// AddNumberParam("Number", "Enter a number to test if positive.");
AddCondition(0, cf_trigger, "On lose", "Winning", "On game lost", "Triggered when the player uses all earthquakes and there are still buildings standing.", "OnLose");
AddCondition(1, cf_trigger, "On win", "Winning", "On game won", "Triggered when the player destroys all buildings.", "OnWin");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
// AddStringParam("Message", "Enter a string to alert.");
// AddAction(0, af_none, "Alert", "My category", "Alert {0}", "Description for my action!", "MyAction");
AddNumberParam("LevelID", "The level to load (0-indexed)");
AddAction(0, af_none, "Load premade level", "Loading", "Load premade level #{0}", "Load the specified premade level", "LoadLevelWithID")
AddAction(1, af_none, "Load randomized level", "Loading", "Load random level", "Load a level with completely random tiles", "LoadLevelRandom")
AddNumberParam("X", "X position of earthquake");
AddNumberParam("Y", "Y position of earthquake");
AddAction(2, af_none, "Spawn earthquake", "Gameplay", "Spawn earthquake at ({0}, {1})", "Spawn an earthquake at a position", "SpawnEarthquake")
AddNumberParam("X", "X position of indicators");
AddNumberParam("Y", "Y position of indicators");
AddAction(3, af_none, "Update indicators", "Gameplay", "Update indicators using touch coordinates ({0}, {1})", "Update indicators at current touch position", "UpdateIndicators")
AddAction(4, af_none, "Initialize", "Initialization", "Initialize level", "Initialize level", "Initialize")
AddNumberParam("X", "Initial X position of touch");
AddNumberParam("Y", "Initial Y position of touch");
AddAction(5, af_none, "Start angle adjustment", "Gameplay", "Start fault indicators angle adjustment at ({0}, {1})", "Start fault indicators angle adjustment", "StartFaultIndicatorAdjustment")
AddNumberParam("LevelID", "ID of the level to load when Initialize is called");
AddAction(6, af_none, "Set next level ID", "Initialization", "Load level #{0} next", "Set next level to load when Initialize is called", "SetNextLevelID")
AddAction(7, af_none, "Stop all music", "Initialization", "Stop all music", "Stop all music", "StopAllMusic")

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
AddExpression(0, ef_return_number, "Number of premade levels", "Data", "NumLevels", "Return the number of premade levels available.");
AddExpression(1, ef_return_number, "Number of tile types", "Data", "NumTileTypes", "Return the number of different level tile types.");
AddExpression(2, ef_return_number, "Current level ID", "Data", "CurrentLevelID", "Return the ID of the current level.");
AddExpression(3, ef_return_number, "Remaining Buildings", "Data", "RemainingBuildings", "Return the number of remaining buildings in the current level.");
AddExpression(4, ef_return_number, "Remaining Earthquakes", "Data", "RemainingEarthquakes", "Return the number of remaining earthquakes in the current level.");
AddExpression(5, ef_return_number, "Score", "Data", "Score", "Return the score in the current level.");
AddExpression(5, ef_return_string, "Instructions", "Data", "Instructions", "Return the instructions for the current level.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
	new cr.Property(ept_float,		"Isometric Tile Height",	98,	"The height of a single 1x1x0 tile sprite in-game."),
	new cr.Property(ept_integer,		"Grid Size",	16,	"The height and width of the tile grid of the level."),
	new cr.Property(ept_float,		"Top Tile X",	1670,	"The X position of the bottom(origin) of the topmost tile in the level."),
	new cr.Property(ept_float,		"Top Tile Y",	880,	"The Y position of the bottom(origin) of the topmost tile in the level."),
	new cr.Property(ept_float,		"Epicenter Icon X",	360,	"The X position of the middle of the topleftmost epicenter icon in the HUD."),
	new cr.Property(ept_float,		"Epicenter Icon Y",	34,		"The Y position of the middle of the topleftmost epicenter icon in the HUD."),
	new cr.Property(ept_float,		"Epicenter Icon Step",	40,		"The spacing between epicenter icons in the HUD."),
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}