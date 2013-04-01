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
		
		var TYPE_INDEX_DIRT;
		var TYPE_INDEX_WATER;
		var TYPE_INDEX_GRASS;
		var TYPE_INDEX_HOUSE;
		var TYPE_INDEX_OFFICE;
		
		var types = this.runtime.types_by_index;
		for(var i = 0; i < types.length; i++){
			var behavs = types[i].behaviors;
			for(var b = 0; b < types[i].behaviors.length; b++){
				var behav = behavs[b];
				if (types[i].behaviors[b].name === "CQDirt"){
					TYPE_INDEX_DIRT = i;
					break;
				} else if (types[i].behaviors[b].name === "CQWater"){
					TYPE_INDEX_WATER = i;
					break;
				} else if (types[i].behaviors[b].name === "CQGrass"){
					TYPE_INDEX_GRASS = i;
					break;
				} else if (types[i].behaviors[b].name === "CQHouse"){
					TYPE_INDEX_HOUSE = i;
					break;
				} else if (types[i].behaviors[b].name === "CQOffice"){
					TYPE_INDEX_OFFICE = i;
					break;
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
			/*"FireStation", // 6 
			"Hospital", // 7
			"Factory", // 8 
			"Airport", // 9 
			"Runway", // 10 */
		];
		this.tileTypeIndices = 
		[
			-1, //"None", // 0 - unintialized
			TYPE_INDEX_DIRT, //"Dirt", // 1
			TYPE_INDEX_WATER, //"Water", // 2 
			TYPE_INDEX_GRASS, //"Grass", // 3 
			TYPE_INDEX_HOUSE, //"House", // 4 
			TYPE_INDEX_OFFICE, //Office", // 5
			//"FireStation", // 6 
			//"Hospital", // 7 
			//"Factory", // 8 
			//"Airport", // 9 
			//"Runway", // 10 */
		];
		var BOTTOM = 1;
		var TOP = 3;
		this.tileTypeLayers = 
		[
			-1, // 0
			BOTTOM, // 1 ground
			BOTTOM, // 2 ground
			BOTTOM, // 3 ground
			TOP, // 4 building
			TOP, // 5 building
			/*"FireStation" // 5 
			"Hospital" // 6 
			"Factory" // 7 
			"Airport" // 8 
			"Runway" // 9 */
		];
		
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
		this.premadeLevels = 
		[
			[[D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, G],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [H, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W]],
			 
			[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
			 
			[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
		];
		
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
	};
	
	instanceProto.tick = function ()
	{
		//check for level stuff
	};
	
	instanceProto.onKeyDown = function (info)
	{	
		switch (info.which) {
			case 13:
				this.runtime.changelayout = this.runtime.layouts_by_index[0];
				break;
		}
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

	Acts.prototype.LoadLevelWithID = function (levelid)
	{
		this.tileGrid = this.premadeLevels[levelid];
		this.loadLevel(false);
	};
	
	Acts.prototype.LoadLevelRandom = function ()
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
		this.TILE_HEIGHT = this.properties[0];	
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
				
				// create sprite at i, j
				var tile = this.tileGrid[i][j];
				if (substitubeBlanksWithDirt && tile == 0) tile = 1;
				if (tile > 0){
					var newInstance = this.runtime.createInstance(
											this.runtime.types_by_index[this.tileTypeIndices[tile]],
											this.runtime.running_layout.layers[this.tileTypeLayers[tile]],
											xPos,
											yPos);
					this.objGrid[i][j] = newInstance;
				}
				xPos += this.TILE_HEIGHT * 2; //shift tile length to the right
			}
			baseX += (vertRow > 0) ? -this.TILE_HEIGHT : this.TILE_HEIGHT //shift left/right depending on row	
			baseY += this.TILE_HEIGHT/2; //shift down each row
			xPos = baseX;
			yPos = baseY;
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
		ret.set_int(this.premadeLevels.length);
	};
	
	Exps.prototype.NumTileTypes = function (ret)
	{
		ret.set_int(this.tileTypeIndices.length);
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());