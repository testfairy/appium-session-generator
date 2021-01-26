package com.testfairy.appium.testapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.Button
import kotlinx.android.synthetic.main.activity_scroll_test.*

class ScrollTest : AppCompatActivity() {

	private val itemTexts = listOf(
		"This activity is full of useless buttons. Only the correct button will close the activity. You will see the list scrolling until the correct button is clicked.",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Correct Button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button ",
		"Useless button "
	)

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_scroll_test)

		items.adapter = object : BaseAdapter() {
			override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
				var actionButton = if (convertView == null) {
					Button(this@ScrollTest)
				} else {
					convertView as Button
				}

				actionButton.setOnClickListener {
					if (actionButton.text.contains("Correct")) {
						finish()
					} else {
						showAlert("WRONG BUTTON!")
					}
				}

				actionButton.text = getItem(position) as String
				actionButton.textSize = 16f

				return actionButton
			}

			override fun getItem(position: Int): Any {
				return itemTexts[position] + if (position != 0) position else ""
			}

			override fun getItemId(position: Int): Long {
				return position.toLong()
			}

			override fun getCount(): Int {
				return itemTexts.size
			}
		}
	}
}
