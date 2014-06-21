var default_config = {
    grid_width:  20, // the amount of cells in the grid in horizontal direction.
    grid_height: 20, // the amount of cells in the grid in vertical direction.
    ////
    cell_width:  20, // the width of a cell in pixels.
    cell_height: 20, // the height of a cell in pixels.
    ////
    mine_load_factor: 0.25, // percentage of mines in the entire grid.
    ////
    canvas_name: "cnvs", // the default name of a target canvas.
    
    min: {
        grid_width:  2, // the minimum grid width.
        grid_height: 2, // the minimum grid height.
        ////
        cell_width:  10, // the minimum cell width in pixels.
        cell_height: 10, // the minimum cell height in pixels.
        ////
        mine_load_factor: 0.01 // the minimum percentage of mines in a grid.
    },
    
    max: {
        mine_load_factor: 0.99
    },
    
    colors: {
        background_color: "#b9b9b9",
        border_color:     "#3333ff",
        aim_color:        "#ff0000"
    }
};

// Initializes the minesweeper.js.
function minesweeper_init(config) {
    check_config(config);
    var canvas_element = (config.canvas_name ? 
                          document.getElementById(config.canvas_name) :
                          document.getElementsByTagName("canvas")[0]);
    
    var grid = new Grid(config.grid_width,
                        config.grid_height,
                        config.mine_load_factor);
    
    GraphicsModule.set_data(canvas_element,
                            grid,
                            config.cell_width,
                            config.cell_height);
                            
    GraphicsModule.redraw();
    GraphicsModule.aim_highlight_cell(0, 0);
    
    engine.config = config;
    
    attachMouseListener(canvas_element, engine);
    attachKeyboardListener(engine);
}

var keys = {
    KEY_UP:     38,  // Aim movement keys.
    KEY_RIGHT:  39,
    KEY_DOWN:   40,
    KEY_LEFT:   37,
    
    KEY_AA:     65,  // Alternative movement capital keys.
    KEY_SS:     83,
    KEY_DD:     68,
    KEY_WW:     87,
    
    KEY_A:      97,  // Alternative movement capital keys.
    KEY_S:      115,
    KEY_D:      100,
    KEY_W:      119,
    
    KEY_SPACE:  32,  // Mine flag toggle key.
    KEY_O:      79,  // Open non-flagged cell key.
    
    KEY_SHIFT:  16   // Shift key.
};

var engine = {
    running:            false,
    last_valid_cell_x:  0,
    last_valid_cell_y:  0,
    game_start_time:    undefined,
    mines_flagged:      0,
    config:             undefined,
    grid:               undefined,
    shift_pressed:      false,
    
    start: function(conf) {
        running = true;
        last_valid_cell_x = 0;
        last_valid_cell_y = 0;
        mines_flagged = 0;
        config = conf;
        
        grid = new Grid(config.grid_width, 
                        config.grid_height,
                        config.mine_load_factor);
                        
        game_start_time: new Date().getTime();
    }
};

function attachMouseListener(canvas_element, engine) {
    var listener = function(e) {
        var x = e.offsetX;
        var y = e.offsetY;
        
        GraphicsModule.redraw();
        
        function set_last_valid_cell(engine) {
            GraphicsModule.aim_highlight_cell(engine.last_valid_cell_x,
                                              engine.last_valid_cell_y);
        }
        
        if (x % (engine.config.cell_width + 1) === 0) {
            // Mouse pointer at the border.
            set_last_valid_cell(engine);
            return;
        }
        
        if (y % (engine.config.cell_height + 1) === 0) {
            // Mouse pointer at the border.
            set_last_valid_cell(engine);
            return;
        }
        
        x /= (engine.config.cell_width + 1);
        y /= (engine.config.cell_height + 1);
        
        x = Math.floor(x);
        y = Math.floor(y);
        
        if (x >= engine.config.grid_width) {
            // Out of bounds.
            set_last_valid_cell(engine);
            return;
        }
        
        if (y >= engine.config.grid_height) {
            // Out of bounds.
            set_last_valid_cell(engine);
            return;
        }
        
        // Once here, we have a highlighted point (x, y);
        engine.last_valid_cell_x = x;
        engine.last_valid_cell_y = y;
        GraphicsModule.aim_highlight_cell(x, y);
    };
    
    canvas_element.addEventListener("mousemove", listener, false);
}

function attachKeyboardListener(engine) {
    var listener = function(e) {
        
        function try_move_aim(engine, dx, dy) {
            if (dx > 0) {
                engine.last_valid_cell_x += (e.shiftKey ? 3 : 1);
            } else if (dx < 0) {
                engine.last_valid_cell_x -= (e.shiftKey ? 3 : 1);
            } else if (dy > 0) {
                engine.last_valid_cell_y += (e.shiftKey ? 3 : 1);
            } else if (dy < 0) {
                engine.last_valid_cell_y -= (e.shiftKey ? 3 : 1);
            }
            
            if (engine.last_valid_cell_x < 0) {
                engine.last_valid_cell_x = 0;
            } else if (engine.last_valid_cell_x >= engine.config.grid_width) {
                engine.last_valid_cell_x = engine.config.grid_width - 1;
            } else if (engine.last_valid_cell_y < 0) {
                engine.last_valid_cell_y = 0;
            } else if (engine.last_valid_cell_y >= engine.config.grid_height) {
                engine.last_valid_cell_y = engine.config.grid_height - 1;
            }
            
            GraphicsModule.redraw();
            GraphicsModule.aim_highlight_cell(engine.last_valid_cell_x,
                                              engine.last_valid_cell_y);
        }
        
        switch (e.keyCode) {
            case keys.KEY_UP:
            case keys.KEY_WW:
            case keys.KEY_W:
                try_move_aim(engine, 0, -1);
                break;
                
            case keys.KEY_RIGHT:
            case keys.KEY_DD:
            case keys.KEY_D:
                try_move_aim(engine, 1, 0);
                break;
                
            case keys.KEY_DOWN:
            case keys.KEY_SS:
            case keys.KEY_S:
                try_move_aim(engine, 0, 1);
                break;
                
            case keys.KEY_LEFT:
            case keys.KEY_AA:
            case keys.KEY_A:
                try_move_aim(engine, -1, 0);
                break;
                
            case keys.SHIFT:
                engine.shift_pressed = true;
        }
    };
    
    document.onkeydown = listener;  
}

// Makes sure that the configuration object has all required fields and those
// fields' values are within valid ranges.
function check_config(config) {
    // Check the grid width.
    if (!config.grid_width || !is_integer(config.grid_width)) {
        config.grid_width = default_config.grid_width;
    } else if (config.grid_width < default_config.min.grid_width) {
        config.grid_width = default_config.min.grid_width;
    }
    
    // Check the grid height.
    if (!config.grid_height || !is_integer(config.grid_height)) {
        config.grid_height = default_config.grid_height;
    } else if (config.grid_height < default_config.min.grid_height) {
        config.grid_height = default_config.min.grid_height;
    }
    
    // Check the cell width.
    if (!config.cell_width || !is_integer(config.cell_width)) {
        config.cell_width = default_config.cell_width;
    } else if (config.cell_width < default_config.min.cell_width) {
        config.cell_width = default_config.min.cell_width;
    }
    
    // Check the cell height.
    if (!config.cell_height || !is_integer(config.cell_height)) {
        config.cell_height = default_config.cell_height;
    } else if (config.cell_height < default_config.min.cell_height) {
        config.cell_height = default_config.cell_height;
    }
    
    // Check the mine load factor.
    if (!config.mine_load_factor || !is_float(config.mine_load_factor)) {
        config.mine_load_factor = default_config.mine_load_factor;
    } else if (config.mine_load_factor < default_config.min.mine_load_factor) {
        config.mine_load_factor = default_config.min.mine_load_factor;
    } else if (config.mine_load_factor > default_config.max.mine_load_factor) {
        config.mine_load_factor = default_condig.max.mine_load_factor;
    }
    
    // Check the name of the canvas.
    if (config.canvas_name && !is_string(config.canvas_name)) {
        config.canvas_name = default_config.canvas_name;
    }
}

// Returns 'true' if 'i' is an integer, 'false' otherwise.
function is_integer(i) {
    return typeof i === 'number' 
            && parseFloat(i) === parseInt(i, 10) 
            && !isNaN(i)
            && isFinite(i);
}

// Returns 'true' if 'i' is a decimal number, 'false' otherwise. 
function is_float(i) {
    return typeof i === 'number'
            && !isNaN(i)
            && isFinite(i);
}

// Return 'true' if 's' is a string, 'false' otherwise.
function is_string(s) {
    if (s === undefined || s === null) {
        return false;
    }
    
    return s.substring !== undefined;
}

// Return 'true' if 'o' is an array, 'false' otherwise.
function is_array(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// Return 'true' if 'b' is an boolean, 'false' otherwise.
function is_boolean(b) {
    return b === true || b === false;
}

// Creates an array of points (x, y), where 0 <= x < width and 0 <= y < height.
function create_points(width, height) {
    if (!is_integer(width)) {
        throw "'width' is not an integer!";
    }
    
    if (!is_integer(height)) {
        throw "'height' is not an integer!"
    }
    
    if (width < default_config.min.grid_width) {
        throw "'width' may not be less than " + 
              default_config.min.grid_width + "; current value: " + width + "!";
    }
    
    if (height < default_config.min.grid_height) {
        throw "'height' may not be less than " +
              default_config.min.grid_height + "; current value: " + 
              height + "!";
    }
    
    var point_list = [];
    
    for (var x = 0; x !== width; ++x) {
        for (var y = 0; y !== height; ++y) {
            point_list.push({x: x, y: y});
        }
    }
    
    return point_list;
}

// Shuffles an array.
function shuffle_array(array) {
    if (!is_array(array)) {
        throw "An array expected, but none received!"
    }
    
    if (array.length < 2) {
        return;
    }
    
    for (var i = 0; i !== array.length; ++i) {
        var j = random_int(0, array.length - 1);
        var k = random_int(0, array.length - 1);
        // Swap.
        var tmp = array[j];
        array[j] = array[k];
        array[k] = tmp;
    }
}

// Returns a random integer within range [min, max].
function random_int(min, max) {
    if (!is_integer(min)) {
        throw "'min' is not an integer: " + min;
    }
    
    if (!is_integer(max)) {
        throw "'max' is not an integer: " + max;
    }
    
    if (max < min) {
        throw "'max' (" + max + ") is less than 'min' (" + min + ")!";
    }
    
    if (max === min) {
        return min;
    }
    
    return min + Math.floor(Math.random() * (max - min + 1));
}

var GraphicsModule = (function() {
    var m_canvas;
    var m_grid_width;
    var m_grid_height;
    var m_cell_width;
    var m_cell_height;
    var m_grid;
    var m_ok = false;
    
    function set_data(canvas,
                      grid,
                      cell_width,
                      cell_height) {
        check_defined(canvas,      "'canvas' is not defined!");
        check_defined(grid,        "'grid' is not defined!");
        check_integer(cell_width,  "'cell_width' is not an integer!");
        check_integer(cell_height, "'cell_height' is not an integer!");
        
        check_integer_not_below(cell_width,
                                default_config.min.cell_width,
                                "'cell_width' is too small (" + cell_width + 
                                "), must be at least " +
                                default_config.min.cell_width + "!");
                        
        check_integer_not_below(cell_height,
                                default_config.min.cell_height,
                                "'cell_height' is too small (" + cell_height + 
                                "), must be at least " +
                                default_config.min.cell_height + "!");
        
        m_canvas =      canvas;
        m_grid =        grid;
        m_grid_width =  grid.get_width();
        m_grid_height = grid.get_height();
        m_cell_width =  cell_width;
        m_cell_height = cell_height;
        m_ok =          true;
    }
    
    function redraw() {
        if (m_ok === false) {
            throw "GraphicsModule is not initialized!";
        }
        
        var width_in_pixels =  1 + (m_cell_width + 1)  * m_grid_width;
        var height_in_pixels = 1 + (m_cell_height + 1) * m_grid_height;
        
        m_canvas.width =  width_in_pixels;
        m_canvas.height = height_in_pixels;
        
        var ctx = m_canvas.getContext("2d");
        
        ctx.fillStyle = default_config.colors.background_color;
        ctx.fillRect(0, 0, width_in_pixels, height_in_pixels);
        
        ctx.fillStyle = default_config.colors.border_color;
        ctx.lineWidth = 1;
        
        // Draw horizontal lines.
        for (var row = 0, y = 0; 
                 row !== m_grid_height + 1; 
                 row++, y += (m_cell_height + 1)) {
              draw_horizontal_line(0, y, width_in_pixels, ctx);
        }
        
        // Draw vertical lines.
        for (var column = 0, x = 0;
                 column !== m_grid_width + 1;
                 column++, x += (m_cell_width + 1)) {
              draw_vertical_line(x, 0, height_in_pixels, ctx);
        }
        
        for (var y = 0; y !== m_grid_height; ++y) {
            for (var x = 0; x !== m_grid_width; ++x) {
                var current_cell = m_grid.get_cell(x, y);
                
                draw_character(x, y, "f", ctx);
                
                if (current_cell.is_open()) {
                    
                } else if (current_cell.has_flag()) {
                    
                }
            }
        }
    }
    
    function draw_character(x, y, ch, ctx) {
        var px = Math.min(m_cell_width, m_cell_height) - 2;
        ctx.fillStyle = "blue";
        ctx.font = px + "px Arial";
        ctx.fillText(ch, 
                     x * (m_cell_width + 1) + 1, 
                     y * (m_cell_height + 1) + 1 + px);
    }
    
    function draw_vertical_line(x, y, len, ctx) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, y + 0.5);
        ctx.lineTo(x + 0.5, y + len - 0.5);
        ctx.stroke();
    }
    
    function draw_horizontal_line(x, y, len, ctx) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, y + 0.5);
        ctx.lineTo(x + len - 0.5, y + 0.5);
        ctx.stroke();
    }
    
    function aim_highlight_cell(x, y) {
        if (m_ok === false) {
            throw "GraphicsModule is not initialized!";
        }
        
        var ctx = m_canvas.getContext("2d");
        
        if (x < 0 || x >= m_grid_width) {
            throw "'x' out of bounds! Value: " + x + ", width: " + m_grid_width;
        }
        
        if (y < 0 || y >= m_grid_height) {
            throw "'y' out of bounds! Value: " + y + ", height: " + 
                  m_grid_height;
        }
        
        ctx.fillStyle = "#ff0000";//default_config.colors.aim_color;
        ctx.lineWidth = 1;
        
        var bar_len = Math.floor((2 + Math.min(m_cell_width, 
                                               m_cell_height)) / 3);
                            
        // BEGIN: Top aim bars.
        ctx.fillRect(x * (m_cell_width + 1),
                     y * (m_cell_height + 1),
                     bar_len,
                     2);
                     
        ctx.fillRect((x + 1) * (m_cell_width + 1) - bar_len + 1,
                     y * (m_cell_height + 1),
                     bar_len,
                     2);
        // END: Top aim bars.
        
        // BEGIN: Right aim bars.
        ctx.fillRect((x + 1) * (m_cell_width + 1) - 1,
                     y * (m_cell_height + 1),
                     2,
                     bar_len);
                     
        ctx.fillRect((x + 1) * (m_cell_width + 1) - 1,
                     (y + 1) * (m_cell_height + 1) - bar_len + 1,
                     2, 
                     bar_len);
        // END: Right aim bars.
        
        // BEGIN: Bottom aim bars.
        ctx.fillRect(x * (m_cell_width + 1),
                     (y + 1) * (m_cell_height + 1) - 1,
                     bar_len,
                     2);
                     
        ctx.fillRect((x + 1) * (m_cell_width + 1) - bar_len + 1,
                     (y + 1) * (m_cell_height + 1) - 1,
                     bar_len,
                     2);
        // END: Bottom aim bars.
        
        // BEGIN: Left aim bars.
        ctx.fillRect(x * (m_cell_width + 1),
                     y * (m_cell_height + 1),
                     2,
                     bar_len);
                     
        ctx.fillRect(x * (m_cell_width + 1),
                     (y + 1) * (m_cell_height + 1) - bar_len + 1,
                     2,
                     bar_len);
        // END: Left aim bars.
    }
    
    return {
        set_data:           set_data,
        redraw:             redraw,
        aim_highlight_cell: aim_highlight_cell,
    };
})();

// This class implemenents the cell grid.
function Grid(width, height, mine_load_factor) {
    check_integer(width,  "'width' is not an integer!");
    check_integer(height, "'height' is not an integer!");
    check_integer_not_below(width, 
                            default_config.min.grid_width, 
                            "'width' is below " + 
                            default_config.min.grid_width + "! " +
                            "Actual value is " + width + ".");
    check_integer_not_below(height,
                            default_config.min.grid_height,
                            "'height' is below " + 
                            default_config.min.grid_height + "! " +
                            "Actual value is " + height + ".");
    check_float(mine_load_factor, 
                "'mine_load_factor' is not a floating-point number.");
                    
    this.width = width;
    this.height = height;
    this.cells = [];
    
    for (var y = 0; y !== height; ++y) {
        var row = [];
        
        for (var x = 0; x !== width; ++x) {
            row.push(new GridCell(x, y, false, this));
        }
        
        this.cells.push(row);
    }
    
    var points = create_points(width, height);
    shuffle_array(points);
    this.mines = Math.floor(mine_load_factor * width * height);
    
    // Create the grid cells containing mines.
    for (var i = 0; i < this.mines; ++i) {
        var point = points[i];
        this.cells[point.y][point.x] = new GridCell(point.x, 
                                                    point.y,
                                                    true,
                                                    this);
    }
    
    // Create the grid cells without mines.
    for (var i = this.mines; i < width * height; ++i) {
        var point = points[i];
        this.cells[point.y][point.x] = new GridCell(point.x,
                                                    point.y,
                                                    false,
                                                    this);
    }
}

// This method returns the width of the game grid.
Grid.prototype.get_width = function() {
    return this.width;
};

// This method returns the height of the game grid.
Grid.prototype.get_height = function() {
    return this.height;
};

// This method returns a grid cell unless (x, y) points outside of the grid,
// in which case, null is returned.
Grid.prototype.get_cell = function(x, y) {
    if (x < 0 || x >= this.width) {
        return null;
    }
    
    if (y < 0 || y >= this.height) {
        return null;
    }
    
    return this.cells[y][x];
};

// Returns the amount of mines in this grid.
Grid.prototype.get_mine_amount = function() {
    return this.mines;
};

// This class models an individual cell in the game grid.
function GridCell(x, y, has_mine, grid) {
    check_defined(grid, "'grid' is not an object!");
    check_integer(x, "'x' is not an integer!");
    check_integer(y, "'y' is not an integer!");
    check_boolean(has_mine, "'has_mine' is not an boolean!");
//    check_integer(width, "'width' is not an integer!");
//    check_integer(height, "'height' is not an integer!");
//    check_integer_not_below(width, 
//                            default_config.min.grid_width, 
//                            "'width' is less than " + 
//                            default_config.min.grid_width + "!");
//    check_integer_not_below(height,
//                            default_config.min.grid_height,
//                            "'height' is less than " +
//                            default_config.min.grid_height + "!");
    this.x = x;
    this.y = y;
    this.has_mine = has_mine;
    this.grid = grid;
    this.open = false;
    this.flagged = false;
}

// This method return the list of neighbour cells in the game grid. No more than
// 8 cells are returned or no less than 3.
GridCell.prototype.get_neighbours = function() {
    var neighbour_list = [];
    
    for (var dx = -1; dx !== 2; ++dx) {
        var tmp1 = this.grid.get_cell(x + dx, this.y - 1);
        var tmp2 = this.grid.get_cell(x + dx, this.y + 1);
        
        if (tmp1) {
            neighbour_list.push(tmp1);
        }
        
        if (tmp2) {
            neighbour_list.push(tmp2);
        }
    }
    
    var tmp1 = this.grid.get_cell(x - 1, this.y);
    var tmp2 = this.grid.get_cell(x + 1, this.y);
    
    if (tmp1) {
        neighbour_list.push(tmp1);
    }
    
    if (tmp2) {
        neighbour_list.push(tmp2);
    }
    
    return neighbour_list;
};

GridCell.prototype.get_degree = function() {
    var neighbours = this.get_neighbours();
    var degree = 0;
    
    for (var i = 0; i !== neighbours.length; ++i) {
        if (neighbours[ı].has_mine) {
            ++degree;
        }
    }
    
    return degree;
};

GridCell.prototype.toggle_flag = function() {
    this.flagged = !this.flagged;
};

GridCell.prototype.has_flag = function() {
    return this.flagged;
};

GridCell.prototype.is_open = function() {
    return this.open;
};

// Checks that the argument 'i' is an integer, and if not, throws an exception
// with the message 'msg'.
function check_integer(i, msg) {
    if (!is_integer(i)) {
        throw msg;
    }
}

// Checks that the argument 'f' is a floating-point number, and if not, throws
// an exception with the message 'msg'.
function check_float(f, msg) {
    if (!is_float(f)) {
        throw msg;
    }
}

// Checks that the argument 'b' is a boolean value, and if not, throws an 
// exception with the message 'msg'.
function check_boolean(b, msg) {
    if (!is_boolean(b)) {
        throw msg;
    }
}

// Checks that the integer 'i' is not below 'bound', and if it is, throws an
// exception with the message 'msg'.
function check_integer_not_below(i, bound, msg) {
    if (i < bound) {
        throw msg;
    }
}

// Checks that the object 'o' is not 'null' or 'undefined', and if it is,
// throws an exception with message 'msg'.
function check_defined(o, msg) {
    if (o === null || o === undefined) {
        throw msg;
    }
}