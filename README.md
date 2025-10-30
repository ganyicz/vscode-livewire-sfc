# Livewire SFC support

A VS Code extension that enables comprehensive IDE support for Livewire Single File Components (SFC) / Volt components by intelligently switching between Blade and PHP language modes based on cursor and scroll position.

![Preview][preview.gif]

## Features

- **Context-Aware Language Switching**: Automatically detects whether you're editing PHP logic or Blade template code
- **Complete IDE Integration**: Provides full autocomplete, syntax highlighting, error checking, and IntelliSense
- **Extension Compatibility**: Works seamlessly with existing PHP and Blade extensions
- **Zero Configuration**: Activates automatically for Blade files

## Problem Statement

Livewire SFC and Volt components combine PHP logic with Blade templating in single files. VS Code typically treats these files as pure Blade templates, resulting in lost IDE support for PHP portions. This extension addresses this limitation by dynamically switching language modes based on the active editing context.

## Installation

Install from the VS Code Marketplace. The extension activates automatically when opening files with `.blade.php` extension

## How It Works

The extension monitors both cursor position and scroll position to determine the appropriate language mode:

- **Blade Mode**: Activated when editing template sections, HTML, and Blade directives, or when scrolled to areas where Blade content is visible
- **PHP Mode**: Activated when editing PHP logic blocks, class methods, and expressions, or when scrolled to areas where PHP content is visible

When you scroll to a section where only PHP code is visible (and Blade portions are off-screen), the language mode automatically switches to PHP, and vice versa. This approach ensures that all existing language server features remain fully functional for both PHP and Blade content.

## Technical Implementation

The extension operates by:

1. Tracking cursor position and scroll position changes within Blade files
2. Analyzing visible code context to determine language boundaries
3. Switching VS Code's language mode between `blade` and `php` based on viewport content
4. Maintaining compatibility with all existing language extensions

**Note**: Brief syntax highlighting transitions may occur during mode switches. This is expected behavior and minimal in practice.

## Contributing

Contributions are welcome. Please submit issues, feature requests, or pull requests through the project repository.

## License

Licensed under the MIT License.
