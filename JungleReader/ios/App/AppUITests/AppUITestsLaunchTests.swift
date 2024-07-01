//
//  AppUITestsLaunchTests.swift
//  AppUITests
//
//  Created by Matthew Riley on 2024-06-29.
//

import XCTest

final class AppUITestsLaunchTests: XCTestCase {

    override class var runsForEachTargetApplicationUIConfiguration: Bool {
        true
    }

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor func testLaunch() throws {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
                
        // Insert steps here to perform after app launch but before taking a screenshot,
        // such as logging into a test account or navigating somewhere in the app
        
        snapshot("MainFeed")
        let webViewsQuery = app.webViews.webViews.webViews
        let exploreButton = webViewsQuery/*@START_MENU_TOKEN@*/.buttons["Explore"]/*[[".otherElements[\"JungleReader\"].buttons[\"Explore\"]",".buttons[\"Explore\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
        exploreButton.tap()
        snapshot("ExplorePage")
        
        let backButton = webViewsQuery/*@START_MENU_TOKEN@*/.buttons["Back"]/*[[".otherElements[\"JungleReader\"].buttons[\"Back\"]",".buttons[\"Back\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
        backButton.tap()
        webViewsQuery/*@START_MENU_TOKEN@*/.buttons["ADD FEED"]/*[[".otherElements[\"JungleReader\"].buttons[\"ADD FEED\"]",".buttons[\"ADD FEED\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/.tap()
        snapshot("AddFeed")
        
        let cancelButton = webViewsQuery/*@START_MENU_TOKEN@*/.buttons["Cancel"]/*[[".otherElements[\"JungleReader\"]",".otherElements[\"web dialog\"].buttons[\"Cancel\"]",".buttons[\"Cancel\"]"],[[[-1,2],[-1,1],[-1,0,1]],[[-1,2],[-1,1]]],[0]]@END_MENU_TOKEN@*/
        cancelButton.tap()
        
        let creatinggamesStaticText = webViewsQuery/*@START_MENU_TOKEN@*/.staticTexts["CreatingGames"]/*[[".otherElements[\"JungleReader\"].staticTexts[\"CreatingGames\"]",".staticTexts[\"CreatingGames\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/
        
        let junglereaderElement = webViewsQuery.otherElements["JungleReader"]
        creatinggamesStaticText.tap()
        snapshot("CreatingGames")
        
        backButton.tap()
        
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = "Launch Screen"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
