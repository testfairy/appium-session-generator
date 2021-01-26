package com.testfairy.appium.testapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button

class ViewIdTest : AppCompatActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_view_id_test)
	}

	fun onButtonClick(view: View) {
		val button: Button = view as Button
		if (button.id == R.id.dont_click_me) {
			showAlert("WRONG BUTTON!")
		} else {
			finish()
		}
	}
}
