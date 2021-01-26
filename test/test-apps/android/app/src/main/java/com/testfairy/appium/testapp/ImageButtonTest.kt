package com.testfairy.appium.testapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View

class ImageButtonTest : AppCompatActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_image_button_test)
	}

	fun onButtonClick(view: View) {
		showAlert("WRONG BUTTON!")
	}

	fun onCorrectButtonClick(view: View) {
		finish()
	}
}
