// ECMAScript 5 strict mode
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
		this.BOSSANOVA_NAME = "smoothbossanovabytombor911";
		this.BOSSANOVA_TAG = "bossanova";
		this.EPICITY_NAME = "epicitybyxenogenocide";
		this.EPICITY_TAG = "epicity";
		this.EPICITYSLOW_NAME = "epicitybyxenogenocideslowmo";
		this.EPICITYSLOW_TAG = "epicityslow";
		this.ALL_TAGS = [this.BOSSANOVA_TAG, this.EPICITY_TAG, this.EPICITYSLOW_TAG];
		
		//constants
		this.TILE_HEIGHT = this.properties[0];	
		this.EARTHQUAKE_FINAL_HEIGHT_IN_TILES = 5;
		this.FAULT_INDICATOR_ANIM_SPEED = 7;
		this.FAULT_INDICATOR_ADJUSTMENT_RATIO = 0.33;
		this.FAULT_INDICATOR_ADJUSTMENT_WIDTH = 15 * Math.PI / 180;
		
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
		var A = 9;
		var R = 10;
		this.PREMADE_LEVELS = 
		[
			[[D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, G],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, S, 0, V, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, F, 0, F, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [W, F, F, F, W, F, W, W, W, W, W, W, W, W, W, W]],
			 
			[[H, H, H, H, H, 0, 0, 0, 0, 0, 0, H, G, G, G, G],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, H, G, S, 0, G],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, H, G, 0, 0, G],
			 [H, 0, H, H, 0, 0, H, H, H, H, 0, 0, 0, G, G, G],
			 [H, H, H, H, H, H, H, V, 0, G, G, G, 0, 0, G, 0],
			 [H, 0, H, H, 0, 0, H, 0, 0, G, 0, G, 0, 0, G, 0],
			 [0, 0, H, 0, 0, 0, H, H, H, H, 0, G, G, G, G, 0],
			 [0, H, H, H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, H, H, H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, H, H, H, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
			 [0, 0, 0, F, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, O, W, 0, 0, 0, 0, 0, 0, 0]],
		];
		this.LEVEL_COUNT = this.PREMADE_LEVELS.length;
		this.currentLevelID = 0;
		this.levelToLoad = -1;
		
		//bind keys to this plugin
		jQuery(document).keydown(
			(function (self) {
				return function(info) {
					self.onKeyDown(info);
				};
			})(this)
		);
		
		jQuery(document).keyup(
			(function (self) {
				return function(info) {
					self.onKeyUp(info);
				};
			})(this)
		);
		
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
	};
	
	instanceProto.getTypeIndex = function (typeName)
	{
		return this.typeIndexMap[typeName];
	}
	
	instanceProto.getType = function (typeName)
	{
		return this.runtime.types_by_index[this.typeIndexMap[typeName]];
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
	};
	
	instanceProto.unfreeze = function()
	{
		if (!this.getType("CQFault"))
			return;
		this.faultIndicatorBeingAdjusted = false;
		this.faultFreezeTime = 0;
		this.frozen = false;
		this.runtime.timescale = 1;		
		
		var newFault = this.runtime.createInstance(this.getType("CQFault"), this.runtime.running_layout.layers[this.LAYER_BOTTOM], this.faultIndicator.x, this.faultIndicator.y);
		newFault.angle = this.faultIndicator.angle;
		this.runtime.all_global_vars[1].data += 1;		
		
		this.runtime.DestroyInstance(this.faultIndicator);
		this.faultIndicator = null;
		this.audioInstance.type.plugin.acts.Stop.call(this.audioInstance, this.EPICITYSLOW_TAG);
		this.audioInstance.type.plugin.acts.SetPaused.call(this.audioInstance, this.EPICITY_TAG, 1);
	}
	
	instanceProto.onKeyDown = function (info)
	{	
		switch (info.which) {
			case 13:
				this.currentLevelID = 0;
				this.switchToNextLayout();
				break;
			case 37:
				this.currentLevelID = (this.currentLevelID <= 1) ? this.LEVEL_COUNT : this.currentLevelID - 1;
				this.switchToNextLayout();
				break;
			case 39:
				this.currentLevelID = (this.currentLevelID % this.LEVEL_COUNT) + 1;
				this.switchToNextLayout();
				break;
		}
	};
	
	instanceProto.switchToNextLayout = function ()
	{
		for(var i = 0; i < this.ALL_TAGS.length; i++)			
			this.audioInstance.type.plugin.acts.Stop.call(this.audioInstance, this.ALL_TAGS[i]);
		this.runtime.changelayout = this.getLayoutByName("Level" + this.currentLevelID);
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

	/* // the example condition
	Cnds.prototype.MyCondition = function (myparam)
	{
		// return true if number is positive
		return myparam >= 0;
	}; */
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.Initialize = function ()
	{				
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
		
		// if (this.levelToLoad < 0 || this.levelToLoad >= this.LEVEL_COUNT)
			// this.loadLevelRandom();
		// else
			// this.loadLevelWithID(this.levelToLoad);
			
		//Initialize earthquake indicator after level so that it can be on top
		if (this.earthquakeIndicator != null){
			this.runtime.DestroyInstance(this.earthquakeIndicator);			
		}
		this.earthquakeIndicator = this.runtime.createInstance(
									this.runtime.types_by_index[this.typeIndexMap["CQEarthquakeIndicator"]],
									this.runtime.running_layout.layers[this.LAYER_TOP],
									0,
									0);
		this.moveInstToTop(this.earthquakeIndicator);
		this.earthquakeIndicator.opacity = 0;
		
		this.reddenedSky = false;
		
		for(var i = 0; i < this.runtime.types_by_index.length; i++){
			var type = this.runtime.types_by_index[i];
			if (type.plugin.acts.Play && type.plugin.acts.SetPaused){
				this.audioInstance = type.instances[0];
				this.audioInstance.type.plugin.acts.Play.call(this.audioInstance, [this.BOSSANOVA_NAME, 1], 1, 0, this.BOSSANOVA_TAG);
				break;
			}
		}
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
						if (!this.hasBehavior(newInstance, "CQDestroyable"))
							newInstance.collisionsEnabled = false;
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
	};
	
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
		this.audioInstance.type.plugin.acts.SetPaused.call(this.audioInstance, this.EPICITY_TAG, 0);
		this.audioInstance.type.plugin.acts.Play.call(this.audioInstance, [this.EPICITYSLOW_NAME, 1], 1, 0, this.EPICITYSLOW_TAG);
	}
	
	Acts.prototype.SpawnEarthquake = function (x, y)
	{
		if (!this.frozen){
			if (this.inGameplayArea(x,y)){
				this.runtime.createInstance(
					this.runtime.types_by_index[this.typeIndexMap["CQEarthquake"]],
					this.runtime.running_layout.layers[this.LAYER_BOTTOM],
					x,
					y);
				var BG = this.background.behavior_insts[1];
				BG.shake(this.TILE_HEIGHT/2, 1);			
				if (!this.reddenedSky){
					if (this.runtime.types_by_index[this.typeIndexMap["CQBlueSky"]].instances.length > 0){
						this.hasBehavior(this.runtime.types_by_index[this.typeIndexMap["CQBlueSky"]].instances[0], "Fade").doStart();
						this.runtime.types_by_index[this.typeIndexMap["CQBlueSky"]].instances[0].my_timescale = 1;
					}
					this.reddenedSky = true;
					this.audioInstance.type.plugin.acts.Stop.call(this.audioInstance, this.BOSSANOVA_TAG);
					this.audioInstance.type.plugin.acts.Play.call(this.audioInstance, [this.EPICITY_NAME, 1], 1, 0, this.EPICITY_TAG);
				}
			}
			this.earthquakeIndicator.opacity = 0;
			this.hasBehavior(this.earthquakeIndicator, "CQEarthquakeIndicator").reset();
		} else {
			this.unfreeze();
		}
		this.oldTouchX = 0;
		this.oldTouchY = 0;
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
		if (this.faultIndicator != null){
			this.faultIndicatorInitialAngle = this.faultIndicator.angle;
			this.oldFaultIndicatorPolarTheta = Math.atan2(y - this.faultIndicator.y, x - this.faultIndicator.x);
			this.faultIndicator.cur_anim_speed = this.FAULT_INDICATOR_ANIM_SPEED;
			this.runtime.tickMe(this.faultIndicator);
			this.faultIndicator.my_timescale = 1;
			this.faultIndicatorBeingAdjusted = true;
		}
	};
	
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
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());