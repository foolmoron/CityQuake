﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.CQLevels = function(runtime)
{
	this.runtime = runtime;
};

var CQ;

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.CQLevels.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};	

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		this.runtime.tickMe(this);
		CQ = this;
		
		//audio stuff
		this.audioInstance = null;		
		this.CQ_TAG = "CQ ";
		this.BOSSANOVA_NAME = "smoothbossanovabytombor911";
		this.BOSSANOVA_TAG = CQ + "bossanova";
		this.EPICITY_NAME = "epicitybyxenogenocide";
		this.EPICITY_TAG = CQ + "epicity";
		this.EPICITYSLOW_NAME = "epicitybyxenogenocideslowmo";
		this.EPICITYSLOW_TAG = CQ + "epicityslow";
		this.QUAKESOUND_NAME = "earthquake";
		this.QUAKESOUND_TAG = CQ + "earthquake";
		this.FAULTSOUND_NAME = "fault";
		this.FAULTSOUND_TAG = CQ + "fault";
		this.IGNITESOUND_NAME = "fire";
		this.IGNITESOUND_TAG = CQ + "fire";
		this.CONTAMINATESOUND_NAME = "toxic";
		this.CONTAMINATESOUND_TAG = CQ + "toxic";
		this.INFECTSOUND_NAME = "zombie";
		this.INFECTSOUND_TAG = CQ + "zombie";
		
		this.MUSIC_TAGS = [this.BOSSANOVA_TAG, this.EPICITY_TAG, this.EPICITYSLOW_TAG];
		this.SOUND_TAGS = [this.QUAKESOUND_TAG, this.FAULTSOUND_TAG, this.IGNITESOUND_TAG, this.CONTAMINATESOUND_TAG, this.INFECTSOUND_TAG];
		this.ALL_TAGS = this.MUSIC_TAGS.concat(this.SOUND_TAGS);
		
		this.MUSIC_VOLUME_OFFSET = 0;
		this.SOUND_VOLUME_OFFSET = 0;
		
		//constants
		this.TILE_HEIGHT = this.properties[0];	
		this.EARTHQUAKE_FINAL_HEIGHT_IN_TILES = 5;
		this.FAULT_INDICATOR_ANIM_SPEED = 7;
		this.FAULT_INDICATOR_ADJUSTMENT_RATIO = 0.33;
		this.FAULT_INDICATOR_ADJUSTMENT_WIDTH = 45 * Math.PI / 180;
		
		this.SCORE_MODIFIER_FAULT = 1.5;
		this.SCORE_MODIFIER_SPECIAL = 2.0;
		this.SCORE_BOOST_EXTRA_EARTHQUAKE = 0.05;
		
		//proto declarations		
		this.TYPE_INDEX_DIRT;
		this.TYPE_INDEX_WATER;
		this.TYPE_INDEX_GRASS;
		this.TYPE_INDEX_HOUSE;
		this.TYPE_INDEX_OFFICE;	
		this.TYPE_INDEX_FIRESTATION;	
		this.TYPE_INDEX_HOSPITAL;	
		this.TYPE_INDEX_FACTORY;	
		
		this.globalVarMap = {};
		this.typeIndexMap = {};
		this.tileTypeNames = [];
		this.tileTypeIndices = [];
		this.tileTypeLayers = [];
		this.tileTypeSizes = [];
		this.tileTypeFrames = [];
		this.nextLevelID = 0;
		
		this.background;
		this.LAYER_BOTTOM = 1;
		this.LAYER_HUD = 2;
		this.LAYER_TOP = 3;
		
		var tlm = 0, tlb = 0, trm = 0, trb = 0;
		var blm = 0, blb = 0, brm = 0, brb = 0;
		
		var D = 1;
		var W = 2;
		var G = 3;
		var H = 4;
		var O = 5;
		var S = 6;
		var V = 7;
		var F = 8;
		this.PREMADE_LEVELS = 
		[			 

			[[G, G, G, G, G, G, 0, 0, 0, 0, G, G, G, G, G, G], //01tutorialquakes
			 [G, G, H, H, G, G, 0, 0, 0, 0, G, G, H, H, G, G],
			 [G, H, H, H, H, G, 0, 0, 0, 0, G, H, H, H, H, G],
			 [G, H, H, H, H, G, 0, 0, 0, 0, G, H, H, H, H, G],
			 [G, G, H, H, G, G, 0, 0, 0, 0, G, G, H, H, G, G],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
			 [0, 0, 0, 0, 0, G, W, W, W, W, G, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, G, W, G, G, W, G, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, G, W, G, G, W, G, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, G, W, W, W, W, G, 0, 0, 0, 0, 0],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
			 [G, G, H, H, G, G, 0, 0, 0, 0, G, G, H, H, G, G],
			 [G, H, H, H, H, G, 0, 0, 0, 0, G, H, H, H, H, G],
			 [G, H, H, H, H, G, 0, 0, 0, 0, G, H, H, H, H, G],
			 [G, G, H, H, G, G, 0, 0, 0, 0, G, G, H, H, G, G],
			 [G, G, G, G, G, G, 0, 0, 0, 0, G, G, G, G, G, G]],

			[[G, G, G, G, G, G, G, G, W, W, G, G, G, G, G, G], //02tutorialfaults
			 [G, G, G, G, G, G, G, G, W, W, G, G, G, G, G, G],
			 [G, G, G, G, G, G, G, G, W, W, W, W, W, W, G, G],
			 [W, W, W, W, G, G, G, G, W, W, W, W, W, W, G, G],
			 [W, W, W, W, G, G, G, G, G, G, G, G, W, W, W, W],
			 [G, G, W, W, G, G, G, H, H, G, G, G, W, W, W, W],
			 [G, G, W, W, G, G, G, H, H, G, G, G, G, G, G, G],
			 [O, D, W, W, D, D, D, D, D, D, D, D, D, D, D, O],
			 [O, D, W, W, D, D, D, D, D, D, D, D, D, D, D, O],
			 [G, G, W, W, G, G, G, G, G, G, G, G, G, G, G, G],
			 [G, G, W, W, G, G, G, G, G, H, H, G, G, G, G, G],
			 [G, G, W, W, G, G, G, G, G, H, H, G, G, G, G, G],
			 [G, G, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
			 [G, G, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, G, W, W],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, G, W, W]],

			[[W, W, W, 0, 0, 0, 0, 0, 0, 0, G, H, H, W, W, W], //03tutoriallargebuildings
			 [W, W, 0, 0, 0, 0, 0, 0, 0, 0, G, H, H, O, W, W],
			 [W, W, 0, G, G, G, G, 0, 0, 0, G, G, G, O, H, W],
			 [0, W, 0, G, 0, 0, G, 0, 0, 0, 0, W, W, W, W, W],
			 [G, W, G, G, 0, 0, G, 0, 0, 0, 0, W, G, 0, 0, 0],
			 [0, W, W, 0, 0, G, G, G, G, G, 0, W, G, G, G, 0],
			 [0, 0, W, 0, 0, G, O, O, O, G, 0, W, 0, 0, G, 0],
			 [G, G, W, W, W, G, O, D, O, G, 0, W, W, W, G, 0],
			 [0, G, 0, G, W, G, O, O, O, G, G, G, 0, W, G, 0],
			 [0, G, G, G, W, G, G, G, G, G, 0, G, G, W, H, H],
			 [0, 0, 0, 0, W, 0, 0, G, 0, 0, 0, 0, 0, W, H, O],
			 [0, O, O, 0, W, W, 0, G, G, G, 0, 0, 0, W, H, H],
			 [0, O, O, 0, 0, W, W, W, 0, G, 0, 0, 0, W, H, H],
			 [0, 0, 0, 0, G, G, G, W, G, G, 0, 0, 0, W, W, W],
			 [0, 0, 0, 0, G, 0, W, W, W, 0, 0, 0, 0, W, W, W],
			 [0, 0, 0, 0, G, W, W, W, W, W, 0, 0, 0, W, W, W]],

			[[W, W, W, W, W, W, D, D, H, H, G, G, W, W, W, W], //04tutorialfire
			 [W, W, W, W, W, O, D, D, H, H, G, S, S, W, W, W],
			 [W, W, W, W, H, G, G, D, H, H, G, S, S, G, W, W],
			 [W, W, W, G, G, G, G, D, D, H, G, G, G, G, G, W],
			 [O, W, W, G, G, G, G, H, D, D, H, G, G, G, G, W],
			 [G, W, W, G, G, G, G, G, G, D, D, H, G, G, G, W],
			 [G, W, W, W, W, G, S, S, G, G, D, D, H, G, G, W],
			 [G, W, W, W, W, G, S, S, G, G, O, D, H, O, G, W],
			 [G, G, G, W, W, G, G, G, G, G, G, D, D, H, H, W],
			 [G, G, G, W, W, G, G, G, G, G, G, G, D, D, W, W],
			 [G, G, G, W, W, W, W, G, G, G, G, G, G, D, W, W],
			 [G, S, S, W, W, W, W, O, G, G, G, G, G, W, W, W],
			 [G, S, S, G, G, G, W, H, G, G, G, G, H, W, W, W],
			 [D, G, G, G, G, G, W, W, G, G, G, G, G, W, W, W],
			 [D, D, G, G, G, G, G, W, G, G, G, G, W, W, W, W],
			 [D, D, D, G, G, G, G, W, W, G, O, H, W, W, W, W]],

			[[G, G, O, W, W, W, D, D, O, W, W, W, W, W, W, O], //05tutorialfactory
			 [G, G, G, W, W, O, D, D, D, W, W, G, G, F, G, G],
			 [G, G, F, W, H, G, G, D, D, W, G, G, G, F, G, G],
			 [G, G, F, G, G, G, G, D, D, W, G, G, G, W, G, G],
			 [G, G, G, G, G, G, D, D, D, D, G, G, G, W, W, W],
			 [G, G, G, O, W, W, W, G, G, D, D, G, G, W, W, W],
			 [G, G, G, W, W, W, W, S, S, G, D, D, G, G, W, W],
			 [G, G, F, W, W, W, W, S, S, G, G, D, G, F, W, W],
			 [G, G, F, W, D, D, D, G, G, G, G, D, G, F, W, W],
			 [G, G, G, G, D, D, D, G, G, G, O, D, G, G, W, W],
			 [G, G, G, G, G, D, D, D, D, D, D, D, G, G, G, G],
			 [G, G, G, G, G, W, W, W, W, D, D, G, G, G, W, W],
			 [G, G, F, W, H, H, H, H, W, G, G, G, G, F, W, W],
			 [G, G, F, W, H, G, G, H, W, G, G, G, G, F, W, W],
			 [G, G, G, W, H, H, H, H, W, G, G, G, W, W, W, W],
			 [G, G, G, W, W, W, W, W, W, G, G, G, W, W, W, W]],

			[[H, H, H, 0, D, D, 0, 0, 0, W, W, W, W, W, W, 0], //06tutorialhospital
			 [H, O, H, 0, 0, D, D, 0, 0, W, G, G, G, G, G, G],
			 [H, H, H, 0, 0, G, D, D, 0, W, G, V, V, G, G, G],
			 [G, G, H, H, H, G, G, D, D, W, G, V, V, G, G, G],
			 [G, G, H, H, H, H, G, G, D, D, G, H, H, G, G, W],
			 [G, G, H, H, W, H, H, G, G, D, D, G, H, G, W, W],
			 [G, G, H, W, W, W, H, H, G, G, D, D, H, H, W, W],
			 [D, G, H, W, W, W, W, H, G, G, G, D, D, H, W, W],
			 [D, D, H, H, W, V, V, H, G, G, G, D, D, H, W, W],
			 [D, D, D, H, H, V, V, H, G, G, G, D, D, H, G, W],
			 [D, D, D, D, D, D, D, D, D, D, D, D, D, H, G, G],
			 [D, D, D, D, D, D, D, D, D, D, D, D, D, H, G, G],
			 [D, D, G, G, H, H, H, H, G, G, G, G, G, H, G, G],
			 [D, G, G, G, H, V, V, H, G, G, G, G, G, H, H, G],
			 [G, G, G, G, H, V, V, H, G, G, G, G, G, H, O, H],
			 [G, G, G, G, H, H, H, H, G, G, G, G, G, G, H, H]],

			[[H, H, H, H, H, 0, 0, 0, 0, 0, 0, H, G, G, G, G], //07foolbasic
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, H, G, S, S, G],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, H, G, S, S, G],
			 [H, 0, H, H, 0, 0, H, H, H, H, 0, 0, 0, G, G, G],
			 [H, H, H, H, H, H, H, V, V, G, G, G, 0, 0, G, 0],
			 [H, 0, H, H, 0, 0, H, V, V, G, 0, G, 0, 0, G, 0],
			 [0, 0, H, 0, 0, 0, H, H, H, H, 0, G, G, G, G, 0],
			 [0, H, H, H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, H, H, H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, H, H, H, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
			 [0, 0, 0, F, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, F, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0]],

			[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, H, G, G, S, S], //08Jeffrey1
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, G, H, H, S, S],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, G, G, G, G],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, G, G, H],
			 [W, H, 0, 0, H, H, H, 0, 0, 0, 0, 0, 0, G, G, G],
			 [W, H, 0, 0, H, H, H, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [W, H, 0, 0, H, H, H, H, 0, 0, 0, 0, 0, 0, 0, 0],
			 [W, W, W, 0, 0, 0, H, O, O, 0, 0, 0, 0, 0, 0, 0],
			 [0, H, W, W, 0, 0, 0, O, O, H, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, W, 0, 0, 0, 0, H, H, H, H, 0, 0, 0, 0],
			 [0, 0, 0, W, W, F, 0, 0, 0, H, H, H, 0, 0, 0, 0],
			 [0, 0, 0, W, W, 0, 0, 0, 0, H, H, H, 0, 0, 0, 0],
			 [0, 0, 0, W, W, W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, W, W, W, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, H, H, W, 0, 0, 0, 0, 0, 0, 0, 0]],

			[[W, W, W, W, W, O, O, G, G, G, G, G, H, D, H, G], //09Cobain1
			 [W, W, W, W, W, O, O, G, G, G, G, G, H, D, H, G],
			 [W, W, W, W, W, O, O, G, G, S, S, G, H, D, H, G],
			 [W, W, W, W, W, O, O, G, G, S, S, G, H, D, H, G],
			 [F, F, W, O, O, O, O, G, H, D, D, D, D, D, D, D],
			 [F, F, W, O, O, O, O, G, H, D, H, G, H, D, H, G],
			 [G, G, W, O, O, G, G, G, H, D, H, G, H, D, H, G],
			 [G, G, W, D, D, D, D, D, D, D, H, G, H, D, H, G],
			 [G, G, W, G, G, G, G, G, G, G, G, G, H, D, H, G],
			 [G, G, W, G, G, H, H, H, H, H, H, H, H, H, G, G],
			 [G, G, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
			 [G, G, V, V, H, H, H, H, H, H, H, H, H, H, W, H],
			 [G, G, V, V, G, G, G, G, G, G, G, G, G, H, W, H],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, H, W, H],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, H, W, H],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, G, W, G]],

			[[H, G, H, G, H, G, G, V, V, G, G, G, G, G, G, G], //10genny1
			 [G, O, G, H, G, H, G, V, V, G, G, H, G, G, O, G],
			 [W, W, D, G, G, H, G, H, G, G, G, G, G, G, G, G],
			 [G, D, W, W, W, D, H, H, G, H, G, G, S, S, G, G],
			 [F, G, G, O, D, W, D, W, W, H, H, G, S, S, G, G],
			 [F, F, H, H, O, O, W, G, D, W, D, G, G, G, G, G],
			 [G, S, S, H, F, F, G, G, G, G, W, W, G, G, H, G],
			 [G, S, S, H, H, F, H, O, G, F, F, D, W, G, G, H],
			 [F, G, G, V, V, H, H, G, O, H, F, G, D, W, G, G],
			 [F, F, O, V, V, O, F, H, H, H, H, G, G, D, W, W],
			 [G, H, G, H, G, H, F, F, G, G, H, H, D, W, D, G],
			 [W, G, W, W, G, G, G, G, G, G, G, D, W, D, G, G],
			 [D, W, D, D, W, D, W, W, W, D, W, W, W, G, G, H],
			 [H, G, G, G, G, W, D, G, G, W, G, G, S, S, G, G],
			 [G, O, G, H, G, G, G, H, H, G, H, G, S, S, O, G],
			 [G, G, G, G, G, H, G, H, G, H, G, G, H, G, G, G]],

			[[H, H, D, D, S, S, D, W, G, G, W, D, D, D, D, D], //11mariaville
			 [H, H, D, D, S, S, D, W, S, S, W, D, H, H, H, D],
			 [G, G, D, D, G, D, D, W, S, S, W, D, D, D, D, D],
			 [G, H, D, D, G, D, D, W, G, G, W, D, D, D, D, D],
			 [G, H, G, G, G, D, D, W, G, G, W, D, H, H, H, D],
			 [G, H, G, G, G, D, D, W, G, H, W, D, D, D, D, D],
			 [G, G, G, G, G, D, D, W, G, G, W, 0, 0, 0, 0, 0],
			 [W, W, W, W, W, D, D, W, G, G, W, W, W, W, W, W],
			 [D, D, D, D, W, W, W, W, G, G, W, G, G, S, S, G],
			 [G, G, G, D, D, G, G, D, H, G, W, G, G, S, S, G],
			 [G, H, H, H, H, H, G, D, G, G, W, G, G, G, G, G],
			 [D, H, G, G, G, H, G, D, G, G, W, H, G, G, H, D],
			 [D, H, G, D, G, H, D, D, G, G, W, H, G, G, H, D],
			 [G, H, G, G, G, H, D, D, H, H, W, H, G, G, H, D],
			 [G, H, H, H, H, H, G, D, H, H, W, H, H, H, H, D],
			 [G, G, D, D, G, G, G, D, G, G, W, D, D, D, D, D]],

			[[G, G, G, G, G, G, G, G, G, H, H, H, H, H, H, H], //12ngirl2
			 [G, G, G, G, G, G, G, G, G, S, S, S, S, S, S, S],
			 [W, 0, 0, 0, 0, 0, 0, W, G, S, S, S, S, S, S, S],
			 [W, W, 0, 0, 0, 0, 0, W, G, G, G, G, G, G, S, S],
			 [W, W, W, 0, 0, 0, 0, W, W, S, S, S, S, G, S, S],
			 [W, F, W, 0, 0, 0, W, W, W, S, S, S, S, G, S, S],
			 [W, F, W, 0, 0, W, W, W, H, H, H, S, S, G, S, S],
			 [W, F, W, W, W, W, W, W, W, W, H, S, S, G, S, S],
			 [W, F, W, W, W, W, W, W, W, W, H, S, S, G, S, S],
			 [W, F, W, 0, 0, W, W, W, H, H, H, S, S, G, S, S],
			 [W, F, W, 0, 0, 0, W, W, W, S, S, S, S, G, S, S],
			 [W, W, W, 0, 0, 0, 0, W, W, S, S, S, S, G, S, S],
			 [W, W, 0, 0, 0, 0, 0, W, G, G, G, G, G, G, S, S],
			 [W, 0, 0, 0, 0, 0, 0, W, G, S, S, S, S, S, S, S],
			 [G, G, G, G, G, G, G, G, G, S, S, S, S, S, S, S],
			 [G, G, G, G, G, G, G, G, G, H, H, H, H, H, H, H]],

			[[0, 0, 0, 0, 0, 0, 0, G, G, 0, 0, 0, 0, 0, 0, 0], //13Omega1Echshire
			 [0, G, G, G, G, G, G, G, G, G, G, G, G, G, G, 0],
			 [0, G, G, H, H, H, 0, 0, 0, 0, H, H, H, G, G, 0],
			 [0, G, H, G, G, H, 0, 0, 0, 0, H, G, G, H, G, 0],
			 [0, G, H, G, G, H, 0, 0, 0, 0, H, G, G, H, G, 0],
			 [0, G, H, H, H, G, H, H, H, H, G, H, H, H, G, 0],
			 [0, G, 0, 0, 0, H, G, O, O, G, H, 0, 0, 0, G, 0],
			 [G, G, 0, 0, 0, H, O, G, G, O, H, 0, 0, 0, G, G],
			 [G, G, 0, 0, 0, H, O, G, G, O, H, 0, 0, 0, G, G],
			 [0, G, 0, 0, 0, H, G, O, O, G, H, 0, 0, 0, G, 0],
			 [0, G, H, H, H, G, H, H, H, H, G, H, H, H, G, 0],
			 [0, G, H, G, G, H, 0, 0, 0, 0, H, G, G, H, G, 0],
			 [0, G, H, G, G, H, 0, 0, 0, 0, H, G, G, H, G, 0],
			 [0, G, G, H, H, H, 0, 0, 0, 0, H, H, H, G, G, 0],
			 [0, G, G, G, G, G, G, G, G, G, G, G, G, G, G, 0],
			 [0, 0, 0, 0, 0, 0, 0, G, G, 0, 0, 0, 0, 0, 0, 0]],

			[[G, G, 0, 0, G, 0, 0, 0, 0, G, W, W, W, W, W, W], //14Omega2DeetonaBeach
			 [G, 0, 0, 0, 0, 0, G, 0, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, H, H, 0, 0, 0, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, G, 0, H, 0, 0, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, 0, 0, 0, H, 0, 0, G, W, W, W, W, W, W],
			 [G, 0, O, 0, 0, 0, 0, H, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, 0, 0, 0, G, H, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, 0, 0, 0, 0, H, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, 0, G, 0, 0, H, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, 0, 0, 0, 0, H, 0, 0, W, W, W, W, W, W],
			 [G, 0, O, 0, 0, 0, G, H, 0, 0, W, W, W, W, D, D],
			 [G, 0, O, 0, 0, 0, H, 0, 0, 0, W, W, W, W, D, G],
			 [G, 0, O, 0, 0, H, 0, 0, 0, 0, W, W, W, W, D, D],
			 [G, 0, O, H, H, 0, 0, 0, G, 0, W, W, W, W, W, W],
			 [G, 0, 0, G, 0, 0, G, 0, 0, 0, W, W, W, W, W, W],
			 [G, 0, G, 0, 0, 0, 0, 0, 0, 0, W, W, W, W, W, W]],

			[[G, G, G, G, V, V, H, H, H, H, H, H, H, H, H, H], //15ngirl1
			 [G, S, S, G, V, V, G, G, G, G, G, G, G, G, G, G],
			 [G, S, S, G, 0, 0, G, H, H, H, H, H, H, V, V, W],
			 [G, W, H, G, 0, 0, G, S, S, W, W, W, W, V, V, W],
			 [G, W, H, G, 0, 0, G, S, S, W, 0, 0, W, W, W, W],
			 [G, W, H, G, 0, 0, G, G, G, W, 0, 0, 0, 0, 0, W],
			 [G, W, H, G, W, W, 0, 0, G, W, 0, 0, 0, 0, 0, W],
			 [G, W, H, F, F, W, 0, 0, G, W, 0, 0, 0, 0, 0, W],
			 [G, W, H, F, F, W, 0, 0, G, W, 0, 0, H, F, F, W],
			 [G, W, W, W, W, W, 0, 0, V, V, 0, 0, H, F, F, W],
			 [G, H, V, V, 0, W, 0, 0, V, V, 0, 0, H, G, W, W],
			 [G, H, V, V, 0, W, 0, 0, 0, 0, 0, 0, H, G, W, W],
			 [G, H, 0, 0, 0, W, 0, 0, 0, 0, 0, S, S, G, W, W],
			 [S, S, 0, 0, 0, V, V, 0, 0, 0, 0, S, S, G, W, W],
			 [S, S, 0, 0, 0, V, V, H, H, H, H, H, H, G, W, W],
			 [G, G, G, G, G, G, G, G, G, G, G, G, G, G, W, W]],

			[[V, V, H, H, H, H, W, W, W, W, W, G, D, H, G, H], //16SpeedYoshi3
			 [V, V, H, G, G, G, W, W, W, W, W, G, D, S, S, G],
			 [H, H, O, G, G, G, G, G, G, G, G, G, D, S, S, H],
			 [H, G, G, D, G, G, G, G, G, G, G, G, O, D, D, D],
			 [H, G, G, G, D, G, G, H, G, G, G, D, G, G, G, G],
			 [H, G, G, G, G, D, H, H, H, G, D, G, G, G, G, G],
			 [W, W, G, G, G, H, D, H, G, D, G, G, G, G, G, G],
			 [W, W, G, G, H, H, H, D, D, G, H, G, G, G, G, G],
			 [W, W, G, G, G, H, G, D, D, H, H, H, G, G, W, W],
			 [W, W, G, G, G, G, D, G, G, D, H, G, G, G, W, W],
			 [W, W, G, G, G, D, G, G, G, G, D, G, G, G, W, W],
			 [G, G, G, G, D, G, G, G, G, G, G, D, G, G, W, W],
			 [D, D, D, O, G, G, G, G, G, G, G, G, D, G, W, W],
			 [H, S, S, D, G, G, G, G, G, G, G, G, G, D, W, W],
			 [G, S, S, D, G, G, G, G, W, W, W, W, W, W, D, W],
			 [H, G, H, D, G, G, G, G, W, W, W, W, W, W, W, D]],

			[[D, W, W, W, D, D, D, D, D, D, O, G, G, G, V, V], //17SpeedYoshi1
			 [D, W, W, W, D, D, O, H, G, D, W, G, G, G, V, V],
			 [D, G, G, G, D, D, H, H, G, D, O, G, S, S, G, G],
			 [D, G, V, V, D, D, D, G, G, D, W, G, S, S, G, G],
			 [D, G, V, V, D, D, D, G, G, D, O, G, G, G, G, G],
			 [D, G, G, G, G, G, D, G, G, D, W, O, W, O, W, O],
			 [D, W, W, W, F, W, D, G, G, D, D, D, D, D, D, D],
			 [D, G, G, G, F, W, D, G, G, G, D, D, D, D, D, D],
			 [D, G, S, S, G, W, D, O, G, G, G, H, H, V, V, D],
			 [D, G, S, S, G, W, D, O, O, G, G, H, H, V, V, D],
			 [D, G, G, G, G, W, W, W, D, H, G, G, G, G, H, D],
			 [D, O, O, O, W, W, D, W, D, H, G, W, W, G, H, D],
			 [D, D, D, D, D, D, D, W, D, H, G, W, W, G, H, D],
			 [G, O, G, O, G, O, D, W, D, H, G, G, G, G, H, D],
			 [W, W, W, W, W, W, W, W, D, H, H, H, H, H, H, D],
			 [H, H, H, H, H, H, H, H, D, D, D, D, D, D, D, D]],

			[[W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W], //18Ytterbium1
			 [W, W, W, W, W, W, W, H, H, W, G, G, G, G, W, W],
			 [W, W, W, W, G, G, W, H, H, W, G, H, H, G, W, W],
			 [G, O, H, W, H, H, W, D, F, W, W, G, H, H, W, W],
			 [G, O, H, W, W, H, W, F, D, W, W, W, H, H, W, W],
			 [W, H, H, W, W, W, W, F, D, W, W, W, W, W, W, W],
			 [W, W, W, W, W, W, W, D, D, W, W, W, W, W, W, W],
			 [W, H, W, W, G, H, W, W, W, W, W, W, W, G, G, W],
			 [W, H, H, W, G, H, H, W, W, W, G, G, G, V, V, W],
			 [W, H, H, W, W, W, W, W, W, G, G, O, O, V, V, W],
			 [W, H, O, H, H, H, G, W, W, W, G, O, O, O, G, W],
			 [W, G, O, O, O, O, G, W, W, S, S, W, O, O, G, W],
			 [W, W, G, H, H, H, H, G, W, S, S, G, G, G, G, W],
			 [W, W, W, W, W, W, H, G, W, W, W, W, W, W, W, W],
			 [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
			 [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W]],
		];
		this.LEVEL_EARTHQUAKE_LIMITS = 
		[
			4,
			4,
			8,
			4,
			6,
			
			6,
			4,
			3,
			4,
			8,
			
			6,			
			4,
			8,
			4,
			4,
			
			4,
			8,
			4,
		];
		this.LEVEL_NAMES = 
		[
			"Crushington",
			"Faultopia",
			"Lay-Z-Pun City",
			"HELLsinki",
			"Detroit",
			
			"South Mercy",
			"Boureng",
			"Sillydelphia",
			"Trembleton",
			"MESSopotamia",
			
			"Mariaville",
			"Smilan",
			"Echshire",
			"Deetona Beach",
			"Loopidoo",
			
			"Killford",
			"St. Andreas",
			"Island Nation",
		];
		this.LEVEL_INSTRUCTIONS = 
		[
			"TIP: Touch to place an earthquake and destroy buildings in the radius!",
			"TIP: Quickly place earthquakes side by side to create a fault. CLICK and DRAG the yellow line to adjust the angle\nof the fault.",
			"TIP: Large buildings require multiple earthquakes to take down, or just one fault.",
			"TIP: Fire stations spread fire to nearby grass. Fire spreads to other grass and destroys any immediately adjacent buildings.",
			"TIP: Factories contaminate nearby water with toxic waste. Waste is similar to fire, but with water.",
			
			"TIP: Hospitals release a virus that spreads nearby houses. Houses spread the virus to other houses as long as they are alive.",
			"TIP: Buildings are awarded a 50% points bonus when destroyed by faults, and a 100% points bonus when destroyed by special effects.",
			"TIP: You get a 5% points bonus at the end of the level for each extra earthquake you have remaining. Play strategically to get the best score!\nGood luck!",
			"",
			"",
			
			"",
			"",
			"",
			"",
			"",
			
			"",
			"",
			"",
		];
		this.LEVEL_COUNT = this.PREMADE_LEVELS.length;
		this.currentLevelID = 0;
		this.levelToLoad = -1;
		
		//bind keys to this plugin
		// jQuery(document).keydown(
			// (function (self) {
				// return function(info) {
					// self.onKeyDown(info);
				// };
			// })(this)
		// );
		
		// jQuery(document).keyup(
			// (function (self) {
				// return function(info) {
					// self.onKeyUp(info);
				// };
			// })(this)
		// );
		
		this.oldTouchX = -1;
		this.oldTouchY = -1;
		this.touchX = -1;
		this.touchY = -1;
		
		this.indicatorOffscreenX = -500;
		this.indicatorOffscreenY = -500;
		this.earthquakeIndicator = null;
				
		this.TOTAL_FAULT_FREEZE_TIME = 1;
		this.faultFreezeTime = 0;
		this.frozen = false;
		this.faultIndicator = null;
		this.faultIndicatorBeingAdjusted = false;
		this.faultIndicatorInitialAngle = 0;
		this.oldFaultIndicatorPolarTheta = 0;
		this.newFaultIndicatorPolarTheta = 0;
		
		this.reddenedSky = false;
		this.levelScore = 0;
		this.levelEarthquakesRemaining = 0;
		this.levelBuildingsRemaining = 0;
		this.levelInstructions = "";
		this.levelVictory = false;
		
		this.EPICENTER_ICONS = new Array(8);
		
		this.officeSounds = 2;
		this.fireSounds = 2;
		this.hospitalSounds = 2;
		this.factorySounds = 2;
		
		this.doCheckLoss = false;
	};
	
	instanceProto.getTypeIndex = function (typeName)
	{
		return this.typeIndexMap[typeName];
	}
	
	instanceProto.getType = function (typeName)
	{
		return this.runtime.types_by_index[this.typeIndexMap[typeName]];
	}
	
	instanceProto.getAudioInstance = function()
	{			
		if (this.audioInstance)
			return this.audioInstance;
		for(var i = 0; i < this.runtime.types_by_index.length; i++){
			var type = this.runtime.types_by_index[i];
			if (type.plugin.acts.Play && type.plugin.acts.SetPaused){ //identify Audio plugin
				this.audioInstance = type.instances[0];
				return this.audioInstance;
			}
		}
	}
	
	instanceProto.tick = function ()
	{
		var dt = this.runtime.dt1; //raw dt
		if (this.frozen && !this.faultIndicatorBeingAdjusted){
			this.faultFreezeTime += dt;
			if (this.faultFreezeTime >= this.TOTAL_FAULT_FREEZE_TIME){	
				this.unfreeze();
			}
		}
		this.officeSounds = 3;
		this.fireSounds = 3;
		this.hospitalSounds = 3;
		this.factorySounds = 3;
		
		if (this.doCheckLoss)
			this.checkLoss();
	};
	
	instanceProto.unfreeze = function()
	{
		if (!this.getType("CQFault"))
			return;
		this.faultIndicatorBeingAdjusted = false;
		this.faultFreezeTime = 0;
		this.frozen = false;
		this.runtime.timescale = 1;		
		
		var newFault = this.runtime.createInstance(this.getType("CQFault"), 
												   this.runtime.running_layout.layers[this.LAYER_BOTTOM], 
												   this.faultIndicator.x, 
												   this.faultIndicator.y);
		newFault.angle = this.faultIndicator.angle;
		this.globalVarMap["x"].data += 1;		
		
		this.runtime.DestroyInstance(this.faultIndicator);
		this.faultIndicator = null;
		
		var BG = this.background.behavior_insts[1];
		BG.behavior.acts.Shake.call(BG, this.TILE_HEIGHT, 0.5, 0);
				
		this.getAudioInstance().type.plugin.acts.Stop.call(this.getAudioInstance(), this.EPICITYSLOW_TAG);
		this.getAudioInstance().type.plugin.acts.SetPaused.call(this.getAudioInstance(), this.EPICITY_TAG, 1);
		this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.FAULTSOUND_NAME, 0], 0, this.SOUND_VOLUME_OFFSET, this.FAULTSOUND_TAG);
	}
	
	instanceProto.onKeyDown = function (info)
	{	
		if (this.runtime.running_layout.name !== "Game")
			return;
		switch (info.which) {
			case 13:
				this.nextLevelID = 0;
				this.switchToNextLayout();
				break;
			case 37:
				this.nextLevelID = (this.currentLevelID <= 1) ? this.LEVEL_COUNT : this.currentLevelID - 1;
				this.switchToNextLayout();
				break;
			case 39:
				this.nextLevelID = (this.currentLevelID % this.LEVEL_COUNT) + 1;
				this.switchToNextLayout();
				break;
		}
	};
	
	instanceProto.switchToNextLayout = function ()
	{
		this.stopAllAudio();
		this.runtime.changelayout = this.getLayoutByName("Game");
	}
	
	instanceProto.getLayoutByName = function (name)
	{
		for(var i = 0; i < this.runtime.layouts_by_index.length; i++){
			if (this.runtime.layouts_by_index[i].name == name)
				return this.runtime.layouts_by_index[i];
		}
		assert2(null, "layout with name " + name + " not found");
		return null;
	};

	instanceProto.onKeyUp = function (info)
	{
		switch (info.which) {
		}
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnLose = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnWin = function ()
	{
		return true;
	};
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.Initialize = function ()
	{				
		this.doCheckLoss = true;
		this.runtime.timescale = 1;
		this.TILE_HEIGHT = this.properties[0];	
		var types = this.runtime.types_by_index;
		for(var i = 0; i < types.length; i++){
			var behavs = types[i].behaviors;
			for(var b = 0; b < types[i].behaviors.length; b++){
				var behav = behavs[b];
				if (types[i].behaviors[b].name === "CQDirt"){
					this.TYPE_INDEX_DIRT = i;
					this.typeIndexMap["CQDirt"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQWater"){
					this.TYPE_INDEX_WATER = i;
					this.typeIndexMap["CQWater"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQGrass"){
					this.TYPE_INDEX_GRASS = i;
					this.typeIndexMap["CQGrass"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQHouse"){
					this.TYPE_INDEX_HOUSE = i;
					this.typeIndexMap["CQHouse"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQOffice"){
					this.TYPE_INDEX_OFFICE = i;
					this.typeIndexMap["CQOffice"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQFireStation"){
					this.TYPE_INDEX_FIRESTATION = i;
					this.typeIndexMap["CQFireStation"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQHospital"){
					this.TYPE_INDEX_HOSPITAL = i;
					this.typeIndexMap["CQHospital"] = i;
					break;
				} else if (types[i].behaviors[b].name === "CQFactory"){
					this.TYPE_INDEX_FACTORY = i;
					this.typeIndexMap["CQFactory"] = i;
					break;
				} else {
					this.typeIndexMap[types[i].behaviors[b].name] = i;
				}
			}
		}		
		this.tileTypeNames = 
		[
			"None", // 0 - unintialized
			"Dirt", // 1
			"Water", // 2 
			"Grass", // 3
			"House", // 4 
			"Office", // 5
			"FireStation", // 6 
			"Hospital", // 7
			"Factory", // 8 
			/*"Airport", // 9 
			"Runway", // 10 */
		];
		this.tileTypeIndices = 
		[
			-1, //"None", // 0 - unintialized
			this.TYPE_INDEX_DIRT, //"Dirt", // 1
			this.TYPE_INDEX_WATER, //"Water", // 2 
			this.TYPE_INDEX_GRASS, //"Grass", // 3 
			this.TYPE_INDEX_HOUSE, //"House", // 4 
			this.TYPE_INDEX_OFFICE, //Office", // 5
			this.TYPE_INDEX_FIRESTATION, // 6 
			this.TYPE_INDEX_HOSPITAL, // 7 
			this.TYPE_INDEX_FACTORY, // 8 
			//"Airport", // 9 
			//"Runway", // 10 */
		];
		this.tileTypeSizes = //base tile sizes {x, y} => x tiles wide, y tiles long, null => 1x1
		[
			null, //"None" - unintialized
			null, //"Dirt", // 1
			null, //"Water", // 2 
			null, //"Grass", // 3 
			null, //"House", // 4 
			null, //"Office", // 5
			[2, 2], //FireStation", // 5
			[2, 2], //"Hospital", // 5
			[2, 1], //"Factory", // 5
			/*"Airport" // 8 
			"Runway" // 9 */
		];
		this.tileTypeFrames = //how many alt-versions each tile has
		[
			0, //"None" - unintialized
			0, //"Dirt", // 1
			0, //"Water", // 2 
			0, //"Grass", // 3 
			0, //"House", // 4 
			0, //"Office", // 5
			2, //FireStation", // 5
			0, //"Hospital", // 5
			2, //"Factory", // 5
			/*"Airport" // 8 
			"Runway" // 9 */
		];
		var BOTTOM = this.LAYER_BOTTOM;
		var TOP = this.LAYER_TOP;
		this.tileTypeLayers = 
		[
			-1, // 0
			BOTTOM, // 1 ground
			BOTTOM, // 2 ground
			BOTTOM, // 3 ground
			TOP, // 4 building
			TOP, // 5 building
			TOP, // 5 
			TOP, // 6 
			TOP // 7 
			/*"Airport" // 8 
			"Runway" // 9 */
		];
		
		this.background = this.runtime.types_by_index[this.typeIndexMap["CQBackground"]].instances[0];		
		
		this.oldTouchX = -1;
		this.oldTouchY = -1;
		this.touchX = -1;
		this.touchY = -1;
	
		//get all global constants from Construst		
		var globals = this.runtime.all_global_vars;
		for(var i = 0; i < globals.length; i++){
			this.globalVarMap[globals[i].name] = globals[i];
		}	
		
			
		this.earthquakeIndicator = this.runtime.types_by_index[this.typeIndexMap["CQEarthquakeIndicator"]].instances[0];
		if (!this.earthquakeIndicator){
			this.earthquakeIndicator = this.runtime.createInstance(
												this.runtime.types_by_index[this.typeIndexMap["CQEarthquakeIndicator"]],
												this.runtime.running_layout.layers[this.LAYER_HUD],
												-100,
												-100);
		}
		this.moveInstToTop(this.earthquakeIndicator);
		this.earthquakeIndicator.opacity = 0;
		
		if (this.faultIndicator)
			this.runtime.DestroyInstance(this.faultIndicator);
		this.faultIndicator = null;
		this.faultIndicatorBeingAdjusted = false;
		this.faultFreezeTime = 0;
		this.frozen = false;
		
		this.reddenedSky = false;
		
		this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.BOSSANOVA_NAME, 1], 1, this.MUSIC_VOLUME_OFFSET, this.BOSSANOVA_TAG);
		
		if (this.nextLevelID > 0 && this.nextLevelID <= this.LEVEL_COUNT)
			this.currentLevelID = this.nextLevelID;
		else
			this.currentLevelID = 0;
		if (this.currentLevelID > 0 && this.currentLevelID <= this.LEVEL_COUNT){
			this.globalVarMap["DESCRIPTION"].data = "#" + this.currentLevelID + ": " + this.LEVEL_NAMES[this.currentLevelID - 1];
			this.globalVarMap["LEVELNAME"].data = this.LEVEL_NAMES[this.currentLevelID - 1];
			this.levelEarthquakesRemaining = this.LEVEL_EARTHQUAKE_LIMITS[this.currentLevelID - 1];		
			this.levelInstructions = this.LEVEL_INSTRUCTIONS[this.currentLevelID - 1];		
		}
		else{
			this.globalVarMap["DESCRIPTION"].data = "Randomized level"
			this.globalVarMap["LEVELNAME"].data = "RANDOM"
			this.levelEarthquakesRemaining = 9999;
			this.levelInstructions = "This is just a level filled with random buildings. For pointless destructive fun!";
		}
		this.levelScore = 0;
		this.levelBuildingsRemaining = 0;
		this.levelVictory = false;
		
		this.EPICENTER_ICONS = new Array(8);
		var baseX = this.properties[4];
		var baseY = this.properties[5];
		var STEP = this.properties[6];
		for(var i = 0; i < this.EPICENTER_ICONS.length && i < this.levelEarthquakesRemaining; i++){
			var x = baseX + (i % 4) * STEP;
			var y = baseY + Math.floor(i / 4) * STEP;
			this.EPICENTER_ICONS[i] = this.runtime.createInstance(
												this.runtime.types_by_index[this.typeIndexMap["CQEpicenterIcon"]],
												this.runtime.running_layout.layers[this.LAYER_HUD],
												x,
												y);
		}
		
		this.loadLevelWithID(this.currentLevelID);
	};
	
	instanceProto.addScore = function(score, modifier)
	{
		this.levelScore += score * modifier;
	};
	
	Acts.prototype.LoadLevelWithID = function (levelid)
	{
		this.loadLevelWithID(levelid);
	};
	
	instanceProto.loadLevelWithID = function(levelid)
	{
		if (levelid <= 0 || levelid > this.LEVEL_COUNT){
			this.loadLevelRandom();
			return;
		} else {
			this.tileGrid = this.PREMADE_LEVELS[levelid - 1];
			this.loadLevel(false);	
		}
	};
	
	Acts.prototype.LoadLevelRandom = function ()
	{
		this.loadLevelRandom();
	};
	
	instanceProto.loadLevelRandom = function()
	{
		this.GRID_SIZE = this.properties[1];
		this.tileGrid = new Array(this.GRID_SIZE);
		for(var i = 0; i < this.GRID_SIZE; i++){
			this.tileGrid[i] = [];
		}
		for(var i = 0; i < this.GRID_SIZE; i++){
			for(var j = 0; j < this.GRID_SIZE; j++){
				var rand = Math.floor(Math.random() * this.tileTypeIndices.length);
				this.tileGrid[i][j] = rand;				
			}
		}
		this.loadLevel(true);
	};
	
	instanceProto.loadLevel = function(substitubeBlanksWithDirt)
	{
		this.GRID_SIZE = this.tileGrid.length;
		var baseX = this.properties[2];
		var baseY = this.properties[3];
		
		this.objGrid = new Array(this.GRID_SIZE);
		for(var i = 0; i < this.GRID_SIZE; i++){
			this.objGrid[i] = [];
		}	
		
		// diagonal traversal algorithm - http://stackoverflow.com/questions/6150382/c-process-2d-array-elements-in-a-diagonal-fashion
		var vertRow, tmp, xIndex;
		var xPos = baseX;
		var yPos = baseY;
		var latestZIndex = 0;
		for(vertRow = this.GRID_SIZE - 1; vertRow > -this.GRID_SIZE; vertRow--)
		{
			tmp = this.GRID_SIZE - Math.abs(vertRow) - 1;
			xIndex = tmp;
			
			while (xIndex >= 0)
			{
				var i, j;
				if (vertRow >= 0) {
					i = xIndex;
					j = tmp - xIndex;
				}
				else {
					i = this.GRID_SIZE - (tmp - xIndex) - 1;
					j = (this.GRID_SIZE - 1) - xIndex;
				}
				--xIndex;
				
				// create sprite at i, j if one isn't already there
				if (this.objGrid[i][j] == null){
					var tile = this.tileGrid[i][j];
					if (substitubeBlanksWithDirt && tile == 0) tile = 1;
					if (tile > 0){
						var size = this.tileTypeSizes[tile];
						var canBuild = true;
						if (size){
							for(var ii = 0; ii < size[0]; ii++){
								for(var jj = 0; jj < size[1]; jj++){
									if (i + ii >= this.GRID_SIZE || j + jj >= this.GRID_SIZE ||
											this.objGrid[i + ii][j + jj] != null)
										canBuild = false;
								}
							}
						}
						if (!canBuild){
							tile = 1;
							size = null;
						}
						var newInstance = this.runtime.createInstance(
												this.runtime.types_by_index[this.tileTypeIndices[tile]],
												this.runtime.running_layout.layers[this.tileTypeLayers[tile]],
												xPos,
												yPos);						
						if (!this.hasBehavior(newInstance, "CQDestroyable")){
							newInstance.collisionsEnabled = false;
							latestZIndex = newInstance.zindex;
						} else {
							this.levelBuildingsRemaining++;
							newInstance.topzindex = latestZIndex;
						}
						//add grass under houses
						if (tile == 4){
							newInstance.grass = this.runtime.createInstance(
												this.runtime.types_by_index[this.typeIndexMap["CQGrass"]],
												this.runtime.running_layout.layers[this.LAYER_BOTTOM],
												xPos,
												yPos);	
						}
						//set extra instance vars					
						newInstance.tileSize = size ? size : [1,1];
						newInstance.tileX = i;
						newInstance.tileY = j;
						if (this.tileTypeFrames[tile] > 0){
							var rand = Math.floor((Math.random()*this.tileTypeFrames[tile]));
							newInstance.changeAnimFrame = rand;
							newInstance.doChangeAnimFrame();
						}
						if (size){
							for(var ii = 0; ii < size[0]; ii++){
								for(var jj = 0; jj < size[1]; jj++){
									if (i + ii < this.GRID_SIZE && j + jj < this.GRID_SIZE)
										this.objGrid[i + ii][j + jj] = newInstance;
								}
							}
						} else {
							this.objGrid[i][j] = newInstance;
						}
					}
				} else {
					var obj = this.objGrid[i][j];					
					if (i == obj.tileX && j == (obj.tileY + (obj.tileSize[1] - 1))) //detect bottom-leftmost tile of object
						this.moveInstToTop(obj);
				}
				xPos += this.TILE_HEIGHT * 2; //shift tile length to the right
			}
			baseX += (vertRow > 0) ? -this.TILE_HEIGHT : this.TILE_HEIGHT //shift left/right depending on row	
			baseY += this.TILE_HEIGHT/2; //shift down each row
			xPos = baseX;
			yPos = baseY;
		}
		
		this.calculateGameplayAreaBounds();	
		this.moveInstToTop(this.earthquakeIndicator);
		
		var topLayer = this.runtime.getLayerByName("Top");
		for(var i = 0; i < topLayer.instances.length; i++){
			if (this.hasBehavior(topLayer.instances[i], "CQLevelName")){
				this.moveInstToTop(topLayer.instances[i]);
				break;
			}				
		}
	};
	
	instanceProto.reportBuildingDead = function(inst)
	{		
		this.levelBuildingsRemaining--;
		if (this.hasBehavior(inst, "CQFireStation")){
			if (this.fireSounds-- > 0)
				this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.IGNITESOUND_NAME, 0], 0, this.SOUND_VOLUME_OFFSET, this.IGNITESOUND_TAG);
		} else if (this.hasBehavior(inst, "CQFactory")){
			if (this.factorySounds-- > 0)
				this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.CONTAMINATESOUND_NAME, 0], 0, this.SOUND_VOLUME_OFFSET, this.CONTAMINATESOUND_TAG);
		} else if (this.hasBehavior(inst, "CQHospital")){
			if (this.hospitalSounds-- > 0)
				this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.INFECTSOUND_NAME, 0], 0, this.SOUND_VOLUME_OFFSET, this.INFECTSOUND_TAG);
		} else if (this.hasBehavior(inst, "CQOffice")){
			if (this.officeSounds-- > 0)
				this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.FAULTSOUND_NAME, 0], 0, this.SOUND_VOLUME_OFFSET, this.FAULTSOUND_TAG);
		}
		if (this.levelBuildingsRemaining === 0){		
			if (this.levelEarthquakesRemaining <= this.EPICENTER_ICONS.length){
				var scoreBoost = (this.levelScore * this.SCORE_BOOST_EXTRA_EARTHQUAKE) * this.levelEarthquakesRemaining;
				this.levelScore += scoreBoost;
			}
			this.levelVictory = true;			
			this.runtime.trigger(cr.plugins_.CQLevels.prototype.cnds.OnWin, this);
		}
	}
	
	instanceProto.hasBehavior = function(inst, behaviorName)
	{
		if (!inst)
			return null;
		for(var i = 0; i < inst.behavior_insts.length; i++){
			if (inst.behavior_insts[i].type.name === behaviorName)
				return inst.behavior_insts[i];
		}	
		return null;
	}
	
	instanceProto.moveInstToTop = function(inst)
	{
		//stolen from commonace.moveToTop
		var zindex = inst.get_zindex();
	
		// is already at top: don't do anything
		if (zindex === inst.layer.instances.length - 1)
			return;
			
		// remove and re-insert at top
		cr.arrayRemove(inst.layer.instances, zindex);
		inst.layer.instances.push(inst);
		inst.runtime.redraw = true;
		
		// all objects on this layer need their z index updating - lazy assign
		inst.layer.zindices_stale = true;
	}	
	
	instanceProto.moveInstToBottom = function(inst)
	{
		//stolen from commonace.moveToBottom
		var zindex = inst.get_zindex();
	
		// is already at bottom: don't do anything
		if (zindex === 0)
			return;
			
		// remove and re-insert at bottom
		cr.arrayRemove(inst.layer.instances, zindex);
		inst.layer.instances.unshift(inst);
		inst.runtime.redraw = true;
		
		// all objects on this layer need their z index updating - lazy assign
		inst.layer.zindices_stale = true;
	}	
	
	instanceProto.moveInstToZIndex = function(inst, zindex)
	{
		//stolen from commonace.moveToBottom
		var zi = inst.get_zindex();
	
		// is already at bottom: don't do anything
		if (zi === 0)
			return;
			
		// remove and re-insert at bottom
		cr.arrayRemove(inst.layer.instances, zi);
		inst.layer.instances.splice(zindex, 0, inst);
		inst.runtime.redraw = true;
		
		// all objects on this layer need their z index updating - lazy assign
		inst.layer.zindices_stale = true;
		inst.layer.updateZIndices();
	}
	
	instanceProto.calculateGameplayAreaBounds = function()
	{	
		var GS = this.GRID_SIZE;
		var TH = this.TILE_HEIGHT;
		var baseX = this.properties[2];
		var baseY = this.properties[3] - TH;
		var p1x, p1y, p2x, p2y;
		p1x = baseX, p1y = baseY;
		p2x = -GS * TH + baseX, p2y = GS * TH/2 + baseY;
		this.tlm = (p2y - p1y) / (p2x - p1x);
		this.tlb = p1y - (this.tlm * p1x);
		p1x = baseX, p1y = baseY;
		p2x = GS * TH + baseX, p2y = GS * TH/2 + baseY;
		this.trm = (p2y - p1y) / (p2x - p1x);
		this.trb = p1y - (this.trm * p1x);
		p1x = baseX, p1y = GS * TH + baseY;
		p2x = -GS * TH + baseX, p2y = GS * TH/2 + baseY;
		this.blm = (p2y - p1y) / (p2x - p1x);
		this.blb = p1y - (this.blm * p1x);
		p1x = baseX, p1y = GS * TH + baseY;
		p2x = GS * TH + baseX, p2y = GS * TH/2 + baseY;
		this.brm = (p2y - p1y) / (p2x - p1x);
		this.brb = p1y - (this.brm * p1x);
	}
	
	instanceProto.inGameplayArea = function(x, y)
	{
		var ret = (y >= this.tlm*x + this.tlb) && (y >= this.trm*x + this.trb) &&
					(y <= this.blm*x + this.blb) && (y <= this.brm*x + this.brb);
		return ret;
	}
	
	instanceProto.setFaultIndicator = function(obj)
	{
		if (this.faultIndicator != null)
			this.runtime.DestroyInstance(this.faultIndicator);
		this.faultIndicator = obj;
		this.runtime.timescale = 0;
		this.frozen = true;
		obj.my_timescale = 1;
		this.stopAllSounds();
		this.getAudioInstance().type.plugin.acts.SetPaused.call(this.getAudioInstance(), this.EPICITY_TAG, 0);
		this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.EPICITYSLOW_NAME, 1], 1, this.MUSIC_VOLUME_OFFSET, this.EPICITYSLOW_TAG);	
	}
	
	Acts.prototype.SpawnEarthquake = function (x, y)
	{
		if (!this.frozen){
			if (this.levelEarthquakesRemaining > 0 && this.inGameplayArea(x,y)){
				this.levelEarthquakesRemaining--;
				if (this.levelEarthquakesRemaining < this.EPICENTER_ICONS.length){
					this.runtime.DestroyInstance(this.EPICENTER_ICONS[this.levelEarthquakesRemaining]);
					this.EPICENTER_ICONS[this.levelEarthquakesRemaining] = null;
				}
				
				var earthquake = this.runtime.createInstance(
					this.runtime.types_by_index[this.typeIndexMap["CQEarthquake"]],
					this.runtime.running_layout.layers[this.LAYER_BOTTOM],
					x,
					y);
				if (this.levelEarthquakesRemaining == 0)
					earthquake.OnDestroy = function() { CQ.checkLoss(); };
				var BG = this.background.behavior_insts[1];
				BG.behavior.acts.Shake.call(BG, this.TILE_HEIGHT/2, 1, 0);
				if (!this.reddenedSky){
					if (this.runtime.types_by_index[this.typeIndexMap["CQBlueSky"]].instances.length > 0){
						this.hasBehavior(this.runtime.types_by_index[this.typeIndexMap["CQBlueSky"]].instances[0], "Fade").doStart();
						this.runtime.types_by_index[this.typeIndexMap["CQBlueSky"]].instances[0].my_timescale = 1;
					}
					this.reddenedSky = true;
					this.getAudioInstance().type.plugin.acts.Stop.call(this.getAudioInstance(), this.BOSSANOVA_TAG);
					this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.EPICITY_NAME, 1], 1, this.MUSIC_VOLUME_OFFSET, this.EPICITY_TAG);
				}
				this.getAudioInstance().type.plugin.acts.Play.call(this.getAudioInstance(), [this.QUAKESOUND_NAME, 0], 0, this.SOUND_VOLUME_OFFSET, this.QUAKESOUND_TAG);
			}
			this.earthquakeIndicator.opacity = 0;
			this.hasBehavior(this.earthquakeIndicator, "CQEarthquakeIndicator").reset();
		} else {
			this.unfreeze();
		}
		this.oldTouchX = 0;
		this.oldTouchY = 0;
	};
	
	instanceProto.checkLoss = function()
	{	
		if (!this.levelVictory){
			if (this.levelEarthquakesRemaining == 0 &&
				this.runtime.types_by_index[this.typeIndexMap["CQEarthquake"]].instances.length == 0 &&
				this.runtime.types_by_index[this.typeIndexMap["CQVirus"]].instances.length == 0 &&
				this.runtime.types_by_index[this.typeIndexMap["CQWaste"]].instances.length == 0 &&
				this.runtime.types_by_index[this.typeIndexMap["CQFire"]].instances.length == 0)
			this.runtime.trigger(cr.plugins_.CQLevels.prototype.cnds.OnLose, this);
		}
	};
	
	Acts.prototype.UpdateIndicators = function (x, y)
	{
		if (this.oldTouchX < 0 || this.oldTouchY < 0){			
			this.oldTouchX = x;
			this.oldTouchY = y;
		}
		this.touchX = x;
		this.touchY = y;		
		var moveX = this.touchX - this.oldTouchX;
		var moveY = this.touchY - this.oldTouchY;
		var moved = moveX != 0 || moveY != 0;
		
		if (!this.frozen){
			this.earthquakeIndicator.x = x;
			this.earthquakeIndicator.y = y;
			this.earthquakeIndicator.set_bbox_changed();
			this.earthquakeIndicator.opacity = this.inGameplayArea(x,y) ? 0.5: 0.0;
		}
		if (moved && this.frozen){
			this.earthquakeIndicator.opacity = 0.0;		
			if (this.faultIndicator != null){
				if (!this.faultIndicatorBeingAdjusted){
					this.startFaultIndicatorAdjustment(x, y);
				}
				var onLeftSide = (x - this.faultIndicator.x) < 0;				
				var actualNewFaultIndicatorPolarTheta = Math.atan2(y - this.faultIndicator.y, x - this.faultIndicator.x);
				var newFaultIndicatorPolarTheta = actualNewFaultIndicatorPolarTheta;
				if (onLeftSide && newFaultIndicatorPolarTheta > 2.5 && this.oldFaultIndicatorPolarTheta < -2.5){ //transitioned down
					//console.log("DOWN=-2PI");
					newFaultIndicatorPolarTheta -= 2*Math.PI;
				} else if (onLeftSide && newFaultIndicatorPolarTheta < -2.5 && this.oldFaultIndicatorPolarTheta > 2.5){ //transitioned up
					//console.log("UP=2PI");
					newFaultIndicatorPolarTheta += 2*Math.PI;
				}
				
				var changeInPolarTheta = (newFaultIndicatorPolarTheta - this.oldFaultIndicatorPolarTheta) * this.FAULT_INDICATOR_ADJUSTMENT_RATIO;
				var newAngle = changeInPolarTheta + this.faultIndicator.angle;
				this.faultIndicator.angle = cr.clamp(newAngle, 
												this.faultIndicatorInitialAngle - this.FAULT_INDICATOR_ADJUSTMENT_WIDTH/2, 
												this.faultIndicatorInitialAngle + this.FAULT_INDICATOR_ADJUSTMENT_WIDTH/2);
				//console.log("old="+this.oldFaultIndicatorPolarTheta + " new=" + newFaultIndicatorPolarTheta + " change=" + changeInPolarTheta + " || initial=" + this.faultIndicatorInitialAngle + " new=" + this.faultIndicator.angle);
				this.oldFaultIndicatorPolarTheta = actualNewFaultIndicatorPolarTheta;
				this.faultIndicator.set_bbox_changed();		
			}
		}
		
		this.oldTouchX = x;
		this.oldTouchY = y;
	};	
	
	Acts.prototype.StartFaultIndicatorAdjustment = function (x, y)
	{
		this.startFaultIndicatorAdjustment(x, y);
	};
	
	instanceProto.startFaultIndicatorAdjustment = function(x, y)
	{
		if (this.faultIndicator != null){
			this.faultIndicatorInitialAngle = this.faultIndicator.angle;
			this.oldFaultIndicatorPolarTheta = Math.atan2(y - this.faultIndicator.y, x - this.faultIndicator.x);
			this.faultIndicator.cur_anim_speed = this.FAULT_INDICATOR_ANIM_SPEED;
			this.runtime.tickMe(this.faultIndicator);
			this.faultIndicator.my_timescale = 1;
			this.faultIndicatorBeingAdjusted = true;
		}
	}
	
	Acts.prototype.SetNextLevelID = function (id)
	{
		this.nextLevelID = id;
	};
	
	Acts.prototype.StopAllMusic = function ()
	{
		this.stopAllAudio();
	};
	
	instanceProto.stopAllAudio = function()
	{	
		for(var i = 0; i < this.ALL_TAGS.length; i++)			
			this.getAudioInstance().type.plugin.acts.Stop.call(this.getAudioInstance(), this.ALL_TAGS[i]);
	}
	
	instanceProto.stopAllMusic = function()
	{	
		for(var i = 0; i < this.MUSIC_TAGS.length; i++)			
			this.getAudioInstance().type.plugin.acts.Stop.call(this.getAudioInstance(), this.MUSIC_TAGS[i]);
	}
	
	instanceProto.stopAllSounds = function(except)
	{	
		for(var i = 0; i < this.SOUND_TAGS.length; i++)		
			if (this.SOUND_TAGS[i] !== except)
				this.getAudioInstance().type.plugin.acts.Stop.call(this.getAudioInstance(), this.SOUND_TAGS[i]);
	}
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	/* // the example expression
	Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_int(1337);				// return our value
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	}; */
	
	Exps.prototype.NumLevels = function (ret)
	{
		ret.set_int(this.PREMADE_LEVELS.length);
	};
	
	Exps.prototype.NumTileTypes = function (ret)
	{
		ret.set_int(this.tileTypeIndices.length);
	};
	
	Exps.prototype.CurrentLevelID = function (ret)
	{
		ret.set_int(this.currentLevelID);
	};
	
	Exps.prototype.RemainingBuildings = function (ret)
	{
		ret.set_int(this.levelBuildingsRemaining);
	};
	
	Exps.prototype.RemainingEarthquakes = function (ret)
	{
		ret.set_int(this.levelEarthquakesRemaining);
	};
	
	Exps.prototype.Score = function (ret)
	{
		ret.set_int(this.levelScore);
	};
	
	Exps.prototype.Instructions = function (ret)
	{
		ret.set_string(this.levelInstructions);
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());