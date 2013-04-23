// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.CQwater = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.CQwater.prototype;
		
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
		// Load properties
		this.inst.SURROUNDING_TILES = [ 
		[-1,-1], [0,-1], [1,-1],
		[-1, 0], 		 [1, 0],
		[-1, 1], [0, 1], [1, 1]
		];
		
		this.WASTE_SPREAD_TIME = this.properties[0];	
		this.WASTE_DEATH_TIME = this.properties[1];
		this.wasteTime = 0;
		
		this.contaminated = false;	
		this.alreadyContaminated = false;
	};
	
	behinstProto.contaminate = function ()
	{
		if (!this.contaminated){
			this.contaminated = true;
			var waste = this.runtime.createInstance(
											this.runtime.types_by_index[CQ.typeIndexMap["CQWaste"]],
											this.runtime.running_layout.layers[CQ.LAYER_TOP],
											this.inst.x,
											this.inst.y - CQ.TILE_HEIGHT / 2);		
			CQ.moveInstToZIndex(waste, this.inst.zindex + 1);	
		}
	}

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		if (this.contaminated){
			this.wasteTime += dt;
			if (!this.alreadyContaminated){
				if (this.wasteTime >= this.WASTE_SPREAD_TIME){
					for (var i = 0; i < this.inst.SURROUNDING_TILES.length; i++){
						var xOffset = this.inst.SURROUNDING_TILES[i][0];
						var yOffset = this.inst.SURROUNDING_TILES[i][1];
						if (this.inst.tileX + xOffset >= 0 && this.inst.tileX + xOffset < CQ.GRID_SIZE &&
						  this.inst.tileY + yOffset >= 0 && this.inst.tileY + yOffset < CQ.GRID_SIZE){
							var waterBehavior = CQ.hasBehavior(CQ.objGrid[this.inst.tileX + xOffset][this.inst.tileY + yOffset], "CQWater");
							if (waterBehavior){
								waterBehavior.contaminate();
							} else {					
								var destroyableBehavior = CQ.hasBehavior(CQ.objGrid[this.inst.tileX + xOffset][this.inst.tileY + yOffset], "CQDestroyable");
								if (destroyableBehavior){
									destroyableBehavior.contaminate();
								}
							}
						}
					}
					this.alreadyContaminated = true;
				}
			}
			if (this.wasteTime >= this.WASTE_DEATH_TIME){
				for (var i = 0; i < this.inst.SURROUNDING_TILES.length; i++){
					var xOffset = this.inst.SURROUNDING_TILES[i][0];
					var yOffset = this.inst.SURROUNDING_TILES[i][1];
					if (this.inst.tileX + xOffset >= 0 && this.inst.tileX + xOffset < CQ.GRID_SIZE &&
					  this.inst.tileY + yOffset >= 0 && this.inst.tileY + yOffset < CQ.GRID_SIZE){
						var destroyableBehavior = CQ.hasBehavior(CQ.objGrid[this.inst.tileX + xOffset][this.inst.tileY + yOffset], "CQDestroyable");
						if (destroyableBehavior){
							CQ.objGrid[this.inst.tileX + xOffset][this.inst.tileY + yOffset].health = 0;							
						}
					}
				}
			}
		}
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