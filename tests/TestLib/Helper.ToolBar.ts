// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
///<reference path="Helper.ts" />
///<reference path="../TestLib/winjs.dev.d.ts" />

module Helper.ToolBar {
    "use strict";

    var _CommandingSurface = <typeof WinJS.UI.PrivateCommandingSurface> Helper.require("WinJS/Controls/CommandingSurface/_CommandingSurface")._CommandingSurface;

    export function verifyRenderedOpened(toolBar: WinJS.UI.PrivateToolBar): void {
        // Verifies that the ToolBar is rendered correctly when opened. 
        // Specifically,
        // 1) Be light dismissible, this includes a click-eating-div (CED) to cover up all other content.
        // 2) Be interact-able, this requires that the ToolBar element be rendered above the CED on the z-stack.
        // 3) Take up layout space when closed, but partially overlay when opened. This means that any 
        // additional space that the ToolBar consumes when it is opened, should not reflow app content, but 
        // overlay on top of the content that was already there.
        //
        // Because the CED needs to cover all other app content it needs to be a child of the body and have a 
        // really high z-index. 
        // Because the ToolBar needs to take up layout space when closed, it is an element that you position 
        // statically in the flow of your document. 
        // Because the ToolBar needs to be interactable when opened, it needs to be positioned non-statically 
        // in the body with an even higher z-index than the CED.
        // Because the ToolBar needs to avoid causing app content to reflow when it opens and closes, it leaves
        // a placeholder element of the same size in its place while the ToolBar is opened. The ToolBar uses
        // fixed positioning, to reposition itself over the placeholder element to create the illusion that it
        // never moved.

        var commandingSurfaceTotalHeight = WinJS.Utilities.getTotalHeight(toolBar._dom.commandingSurfaceEl);
        var commandingSurfaceTotalWidth = WinJS.Utilities.getTotalWidth(toolBar._dom.commandingSurfaceEl);

        var toolBarEl = toolBar.element;
        var toolBarContentHeight = WinJS.Utilities.getContentHeight(toolBarEl);
        var toolBarContentWidth = WinJS.Utilities.getContentWidth(toolBarEl);
        var toolBarTotalHeight = WinJS.Utilities.getTotalHeight(toolBarEl);
        var toolBarTotalWidth = WinJS.Utilities.getTotalWidth(toolBarEl);
        var toolBarRect = toolBarEl.getBoundingClientRect();
        var toolBarStyle = getComputedStyle(toolBarEl);
        var toolBarMarginBoxLeft = toolBarRect.left - WinJS.Utilities.convertToPixels(toolBarEl, toolBarStyle.marginLeft);
        var toolBarMarginBoxTop = toolBarRect.top - WinJS.Utilities.convertToPixels(toolBarEl, toolBarStyle.marginTop);
        var toolBarMarginBoxRight = toolBarRect.right + WinJS.Utilities.convertToPixels(toolBarEl, toolBarStyle.marginRight);
        var toolBarMarginBoxBottom = toolBarRect.bottom + WinJS.Utilities.convertToPixels(toolBarEl, toolBarStyle.marginBottom);

        var placeHolder = toolBar._dom.placeHolder;
        var placeHolderTotalHeight = WinJS.Utilities.getTotalHeight(placeHolder);
        var placeHolderTotalWidth = WinJS.Utilities.getTotalWidth(placeHolder);
        var placeHolderRect = placeHolder.getBoundingClientRect();
        var placeHolderStyle = getComputedStyle(placeHolder);
        var placeHolderMarginBoxLeft = placeHolderRect.left - WinJS.Utilities.convertToPixels(placeHolder, placeHolderStyle.marginLeft);
        var placeHolderMarginBoxTop = placeHolderRect.top - WinJS.Utilities.convertToPixels(placeHolder, placeHolderStyle.marginTop);
        var placeHolderMarginBoxRight = placeHolderRect.right + WinJS.Utilities.convertToPixels(placeHolder, placeHolderStyle.marginRight);
        var placeHolderMarginBoxBottom = placeHolderRect.bottom + WinJS.Utilities.convertToPixels(placeHolder, placeHolderStyle.marginBottom);

        // Verify that the Opened ToolBar contentbox size matches its CommandingSurface's marginbox size.
        LiveUnit.Assert.areEqual(toolBarContentHeight, commandingSurfaceTotalHeight, "Opened ToolBar contentbox height should size to content.");
        LiveUnit.Assert.areEqual(toolBarContentWidth, commandingSurfaceTotalWidth, "Opened ToolBar contentbox width should size to content.");

        // Verify that the opened toolbar is a child of the body element with fixed position.
        LiveUnit.Assert.isTrue(toolBar.element.parentElement === document.body, "Opened ToolBar must be a child of the <body> element");
        LiveUnit.Assert.isTrue(getComputedStyle(toolBar.element).position === "fixed", "Opened ToolBar must have fixed positioning");

        // Verify that the placeholder element is a descendant of the body with static positioning.
        LiveUnit.Assert.isTrue(document.body.contains(placeHolder), "placeholder element must be a descendant of the <body> while ToolBar is opened.");
        LiveUnit.Assert.isTrue(getComputedStyle(placeHolder).position === "static", "placeholder element must have static positioning");

        // Verify that the ToolBar is correctly positioned on top of the placeholder element.
        Helper.Assert.areFloatsEqual(placeHolderMarginBoxLeft, toolBarMarginBoxLeft,
            "Opened ToolBar marginbox's left viewport offset must be identical to the placeHolder marginbox's left viewport offset", 1);
        Helper.Assert.areFloatsEqual(placeHolderMarginBoxRight, toolBarMarginBoxRight,
            "Opened ToolBar marginbox's right viewport offset must be identical to the placeHolder marginbox's right viewport offset", 1);
        switch (toolBar._commandingSurface.overflowDirection) {
            case _CommandingSurface.OverflowDirection.bottom:
                Helper.Assert.areFloatsEqual(placeHolderMarginBoxTop, toolBarMarginBoxTop,
                    "Opened ToolBar marginbox's top viewport offset must be identical to placeHolder marginbox's top viewport offset", 1);
                break;
            case _CommandingSurface.OverflowDirection.top:
                Helper.Assert.areFloatsEqual(placeHolderMarginBoxBottom, toolBarMarginBoxBottom,
                    "Opened ToolBar marginbox's bottom viewport offset must be identical to placeHolder marginbox's bottom viewport offset", 1);
                break;
        }

        Helper._CommandingSurface.verifyRenderedOpened(toolBar._commandingSurface);
    }

    export function verifyRenderedClosed(toolBar: WinJS.UI.PrivateToolBar): void {
        var toolBarContentHeight = WinJS.Utilities.getContentHeight(toolBar.element),
            toolBarContentWidth = WinJS.Utilities.getContentWidth(toolBar.element),
            commandingSurfaceTotalHeight = WinJS.Utilities.getTotalHeight(toolBar._dom.commandingSurfaceEl),
            commandingSurfaceTotalWidth = WinJS.Utilities.getTotalWidth(toolBar._dom.commandingSurfaceEl),
            placeHolder = toolBar._dom.placeHolder;

        // Verify that the Closed ToolBar content size matches its CommandingSurface's total size.
        LiveUnit.Assert.areEqual(toolBarContentHeight, commandingSurfaceTotalHeight, "Closed ToolBar contentbox height should size to content.");
        LiveUnit.Assert.areEqual(toolBarContentWidth, commandingSurfaceTotalWidth, "Closed ToolBar contentbox width should size to content.");

        // Verify we have a parent element and our placeHolder element does not.
        LiveUnit.Assert.isTrue(document.body.contains(toolBar.element), "Closed ToolBar must be a descendant of the body");
        LiveUnit.Assert.isFalse(placeHolder.parentElement, "placeholder must not be in the DOM, while ToolBar is closed");

        Helper._CommandingSurface.verifyRenderedClosed(toolBar._commandingSurface);
    }

    export function useSynchronousAnimations(toolBar: WinJS.UI.PrivateToolBar) {
        Helper._CommandingSurface.useSynchronousAnimations(toolBar._commandingSurface);
    }
}