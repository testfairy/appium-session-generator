package com.testfairy.appium.testapp

import android.os.Bundle
import android.util.Log
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_gestures_test.*


class GesturesTest : AppCompatActivity(), GestureDetector.OnGestureListener,
	GestureDetector.OnDoubleTapListener {

	private val DEBUG_TAG = "Gestures"

	private var mDetector: GestureDetector? = null
	private var clickView: Button? = null
	private var doubleClickView: Button? = null
	private var longClickView: Button? = null
	private var clicked = false
	private var doubleClicked = false
	private var longClicked = false

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_gestures_test)

		clickView = root.getChildAt(1) as Button
		doubleClickView = root.getChildAt(2) as Button
		longClickView = root.getChildAt(3) as Button

		clickView?.isClickable = false
		doubleClickView?.isClickable = false
		longClickView?.isClickable = false

		mDetector = GestureDetector(this, this)
		mDetector!!.setOnDoubleTapListener(this)
	}

	private fun findViewByMotionEvent(event: MotionEvent): View {
		val rootLocation: IntArray = IntArray(2)
		root.getLocationOnScreen(rootLocation)

		val x = Math.round(event.getX())
		val y = Math.round(event.getY()) - rootLocation[1]

		if (x > clickView!!.left && x < clickView!!.right && y > clickView!!.top && y < clickView!!.bottom) {
			//touch is within this child
			return clickView!!
		}

		if (x > doubleClickView!!.left && x < doubleClickView!!.right && y > doubleClickView!!.top && y < doubleClickView!!.bottom) {
			//touch is within this child
			return doubleClickView!!
		}

		if (x > longClickView!!.left && x < longClickView!!.right && y > longClickView!!.top && y < longClickView!!.bottom) {
			//touch is within this child
			return longClickView!!
		}

		return root
	}

	private fun finishIfSuccessful() {
		if (clicked && longClicked && doubleClicked) {
			finish()
		}
	}

	override fun onTouchEvent(event: MotionEvent?): Boolean {
		Log.d(DEBUG_TAG, "onTouchEvent: $event")

		mDetector!!.onTouchEvent(event)
		return super.onTouchEvent(event)
	}

	override fun onDown(event: MotionEvent): Boolean {
		Log.d(DEBUG_TAG, "onDown: $event")
		return false
	}

	override fun onFling(
		event1: MotionEvent, event2: MotionEvent,
		velocityX: Float, velocityY: Float
	): Boolean {
		Log.d(DEBUG_TAG, "onFling: $event1$event2")
		return false
	}

	override fun onLongPress(event: MotionEvent) {
		Log.d(DEBUG_TAG, "onLongPress: $event")

		if (findViewByMotionEvent(event) == longClickView) {
			longClicked = true
			longClickView!!.text = "Done"
		}

		finishIfSuccessful()
	}

	override fun onScroll(
		event1: MotionEvent, event2: MotionEvent, distanceX: Float,
		distanceY: Float
	): Boolean {
		Log.d(DEBUG_TAG, "onScroll: $event1$event2")
		return false
	}

	override fun onShowPress(event: MotionEvent) {
		Log.d(DEBUG_TAG, "onShowPress: $event")
	}

	override fun onSingleTapUp(event: MotionEvent): Boolean {
		Log.d(DEBUG_TAG, "onSingleTapUp: $event")

		return false
	}

	override fun onDoubleTap(event: MotionEvent): Boolean {
		Log.d(DEBUG_TAG, "onDoubleTap: $event")

		if (findViewByMotionEvent(event) == doubleClickView) {
			doubleClicked = true
			doubleClickView!!.text = "Done"
		}

		finishIfSuccessful()

		return false
	}

	override fun onDoubleTapEvent(event: MotionEvent): Boolean {
		Log.d(DEBUG_TAG, "onDoubleTapEvent: $event")
		return false
	}

	override fun onSingleTapConfirmed(event: MotionEvent): Boolean {
		Log.d(DEBUG_TAG, "onSingleTapConfirmed: $event")

		if (findViewByMotionEvent(event) == clickView) {
			clicked = true
			clickView!!.text = "Done"
		}

		finishIfSuccessful()

		return false
	}
}
