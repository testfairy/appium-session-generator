package com.testfairy.appium.testapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button

class XPathTest : AppCompatActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_x_path_test)
	}

	fun onButtonClick(view: View) {
		showAlert("WRONG BUTTON!")
	}

	fun onCorrectButtonClick(view: View) {
		finish()
	}
}
