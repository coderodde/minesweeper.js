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
        cell_width:  5, // the minimum cell width.
        cell_height: 5, // the minimum cell height.
        ////
        mine_load_factor: 0.01 // the minimum percentage of mines in a grid.
    },
    
    max: {
        mine_load_factor: 0.99
    },
    
    colors: {
        background_color: "#ffff00",
        border_color: "#ff0000"
    }
};

// Initializes the minesweeper.js.
function minesweeper_init(config) {
    check_config(config);
    var canvas_element = (config.canvas_name ? 
                          document.getElementById(config.canvas_name) :
                          document.getElementsByTagName("canvas")[0]);
    
    GraphicsModule.set_data(canvas_element,
                            config.grid_width,
                            config.grid_height,
                            config.cell_width,
                            config.cell_height);
                            
    GraphicsModule.redraw();
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
    if (config.canvas_name || !is_string(config.canvas_name)) {
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
    if (!is_int(width)) {
        throw "'width' is not an integer!";
    }
    
    if (!is_int(height)) {
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
    if (!is_int(min)) {
        throw "'min' is not an integer: " + min;
    }
    
    if (!is_int(max)) {
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
    var m_ok = false;
    
    function set_data(canvas,
                      grid_width,
                      grid_height,
                      cell_width,
                      cell_height) {
        check_defined(canvas,      "'canvas' is not defined!");
        check_integer(grid_width,  "'grid_width' is not an integer!");
        check_integer(grid_height, "'grid_height' is not an integer!");
        check_integer(cell_width,  "'cell_width' is not an integer!");
        check_integer(cell_height, "'cell_height' is not an integer!");
        check_integer_not_below(grid_width, 
                                default_config.min.grid_width,
                                "'grid_width' is too small (" + grid_width + 
                                "), must be at least " +
                                default_config.min.grid_width + "!");
        check_integer_not_below(grid_height, 
                                default_config.min.grid_height,
                                "'grid_height' is too small (" + grid_height + 
                                "), must be at least " +
                                default_config.min.grid_height + "!");
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
        
        m_canvas = canvas;
        m_grid_width = grid_width;
        m_grid_height = grid_height;
        m_cell_width = cell_width;
        m_cell_height = cell_height;
        m_ok = true;
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
    }
    
    function highlight_cell(x, y) {
        if (x < 0 || x >= grid_width) {
            throw "'x' out of bounds! Value: " + x + ", width: " + grid_width;
        }
        
        if (y < 0 || y >= grid_height) {
            throw "'y' out of bounds! Value: " + y + ", height: " + grid_height;
        }
    }
    
    return {
        set_data: set_data,
        redraw:   redraw
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
        
    }
    
    // Create the grid cells without mines.
    for (var i = this.mines; i < width * height; ++i) {
        
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
    if (x < 0 || x >= width) {
        return null;
    }
    
    if (y < 0 || y >= height) {
        return null;
    }
    
    return this.cells[y][x];
};

// This class models an individual cell in the game grid.
function GridCell(x, y, has_mine, grid) {
    check_defined(grid, "'grid' is not an object!");
    check_integer(x, "'x' is not an integer!");
    check_integer(y, "'y' is not an integer!");
    check_boolean(has_mine, "'has_mine' is not an boolean!");
    check_integer(width, "'width' is not an integer!");
    check_integer(height, "'height' is not an integer!");
    check_integer_not_below(width, 
                            default_config.min.grid_width, 
                            "'width' is less than " + 
                            default_config.min.grid_width + "!");
    check_integer_not_below(height,
                            default_config.min.grid_height,
                            "'height' is less than " +
                            default_config.min.grid_height + "!");
    this.x = x;
    this.y = y;
    this.has_mine = has_mine;
    this.grid = grid;
    this.open = false;
    this.marked = false;
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