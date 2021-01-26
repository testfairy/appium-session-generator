package com.testfairy.appium.testapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.Toast

class ContentDescriptionTest : AppCompatActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_content_description_test)
	}

	fun onButtonClick(view: View) {
		val button: Button = view as Button
		if (button.contentDescription.contains("dont")) {
			showAlert("WRONG BUTTON!")
		} else {
			finish()
		}
	}
}
