// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.CQhouse = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.CQhouse.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{	
		this.inst.SURROUNDING_TILES = [ 
		[-1,-1], [0,-1], [1,-1],
		[-1, 0], 		 [1, 0],
		[-1, 1], [0, 1], [1, 1]
		];
		
		this.R = 0;
		this.G = 1;
		this.B = 2;
		
		this.VIRUS_SPREAD_TIME = this.properties[0];
		this.VIRUS_DEATH_TIME = this.properties[1];
		this.virusTime = 0;
		
		this.infected = false;	
		this.alreadyInfected = false;
	};
	
	behinstProto.infect = function ()
	{
		if (this.inst.health <= 0)
			return;
		if (!this.infected){
			this.infected = true;
			var virus = this.runtime.createInstance(
											this.runtime.types_by_index[CQ.typeIndexMap["CQVirus"]],
											this.runtime.running_layout.layers[CQ.LAYER_TOP],
											this.inst.x,
											this.inst.y - CQ.TILE_HEIGHT / 2);		
					CQ.moveInstToZIndex(virus, this.inst.zindex + 1);	
		}
	}

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		if (this.infected){
			this.virusTime += dt;
			if (!this.alreadyInfected){
				if (this.virusTime >= this.VIRUS_SPREAD_TIME){
					for (var i = 0; i < this.inst.SURROUNDING_TILES.length; i++){
						var xOffset = this.inst.SURROUNDING_TILES[i][0];
						var yOffset = this.inst.SURROUNDING_TILES[i][1];
						if (this.inst.tileX + xOffset >= 0 && this.inst.tileX + xOffset < CQ.GRID_SIZE &&
						  this.inst.tileY + yOffset >= 0 && this.inst.tileY + yOffset < CQ.GRID_SIZE){
							var houseBehavior = CQ.hasBehavior(CQ.objGrid[this.inst.tileX + xOffset][this.inst.tileY + yOffset], "CQHouse");
							if (houseBehavior){
								houseBehavior.infect();
							}
						}
					}
					this.alreadyInfected = true;
				}
			}
			if (this.virusTime >= this.VIRUS_DEATH_TIME){
				this.inst.health = 0;
			}
		}
	};
	
	behinstProto.onDestroy = function ()
	{
	
	};


	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());