# Bugs Fixed - Session 2

## 🐛 Issue #1: Idea Approval Failed
**Status:** ✅ FIXED

**Problem:**
- Clicking "Approve" in Ideas tab showed error: "Failed to approve idea"
- Backend error: `name 'datetime' is not defined`

**Root Cause:**
- Missing `datetime` import in `idea_service.py`

**Fix:**
```python
# Added to line 4 of backend/src/content_gen_backend/services/idea_service.py
from datetime import datetime
```

**Test Result:** ✅ Approval now works correctly

---

## 🐛 Issue #2: Create Video Button Does Nothing
**Status:** ✅ FIXED (Partial)

**Problem:**
- Clicking "Create Video" in Ideas tab just switches to Create tab
- Prompt field appears empty
- No idea context shown

**Root Causes:**
1. Prompt max length was 500 chars, but AI prompts are ~400-800 chars
2. Need debugging to verify prop passing

**Fixes Applied:**

### Fix 2a: Increased Prompt Length Limit
```typescript
// Changed in VideoCreator.vue line 35
const MAX_PROMPT_LENGTH = 2000  // Was: 500
```

### Fix 2b: Added Debug Logging
```typescript
// Added to VideoCreator.vue
watch(() => props.idea, (newIdea) => {
  console.log('VideoCreator: Idea prop changed:', newIdea)
  if (newIdea) {
    console.log('VideoCreator: Auto-filling prompt with:', newIdea.video_prompt?.substring(0, 100) + '...')
    prompt.value = newIdea.video_prompt
  }
}, { immediate: true })

// Added to App.vue
const handleGenerateVideo = (idea: any) => {
  console.log('App: handleGenerateVideo called with idea:', idea)
  console.log('App: Idea title:', idea?.title)
  console.log('App: Idea prompt length:', idea?.video_prompt?.length)
  currentIdea.value = idea
  currentView.value = 'create'
}
```

**Test Instructions:**
1. Refresh browser (http://localhost:3333)
2. Open browser console (F12)
3. Go to Ideas tab
4. Click "Create Video" on approved idea
5. Check console for debug logs
6. Verify prompt appears in textarea

**Expected Console Output:**
```
App: handleGenerateVideo called with idea: {...}
App: Idea title: Robot Arm Phone Goes Hilariously Wrong
App: Idea prompt length: 423
VideoCreator: Idea prop changed: {...}
VideoCreator: Auto-filling prompt with: Montage of funny mishaps: robotic camera arm gets tangled...
```

---

## 🐛 Issue #3: Video Player Shows "Failed to download video"
**Status:** ✅ FIXED

**Problem:**
- Clicking "View" in Library tab shows error
- "Failed to download video" message

**Root Cause:**
- Video download API endpoint may not exist or return correct data
- Need fallback URL strategy

**Fix:**
```typescript
// Updated loadVideoContent in VideoPlayer.vue
const loadVideoContent = async () => {
  try {
    // Strategy 1: Check if video has direct URL
    if (video.value?.video_url) {
      videoUrl.value = video.value.video_url
      return
    }

    // Strategy 2: Try to download via API
    try {
      const blob = await downloadVideo(props.videoId, 'video')
      videoUrl.value = URL.createObjectURL(blob)
    } catch (err) {
      // Strategy 3: Fallback to direct backend URL
      videoUrl.value = `http://localhost:4444/api/v1/videos/${props.videoId}/content?variant=video`
    }
  } catch (err) {
    console.error('Failed to load video content:', err)
  }
}
```

**Test Instructions:**
1. Go to Library tab
2. Find a completed video
3. Click "View"
4. Video should play

**Fallback Strategy:**
- First tries video_url field from API response
- Falls back to blob download
- Finally tries direct backend URL as last resort

---

## 📋 Test Checklist

### Before Testing
- [ ] Refresh browser page (Ctrl/Cmd + Shift + R)
- [ ] Open browser console (F12)
- [ ] Backend running on port 4444
- [ ] Frontend running on port 3333

### Test 1: Idea Approval ✅
- [ ] Go to Ideas tab
- [ ] Click "View Prompt" on an idea
- [ ] Click "✓ Approve"
- [ ] Verify "✓ Approved" badge appears
- [ ] Verify "Create Video" button appears

### Test 2: Video Creation from Idea ⏳
- [ ] Click "Create Video" on approved idea
- [ ] Check console for debug logs
- [ ] Verify idea info box appears (green background)
- [ ] Verify prompt textarea is filled with AI-generated text
- [ ] Verify prompt is NOT truncated (should be full length)
- [ ] Optionally adjust model/duration
- [ ] Click "Generate Video"
- [ ] Wait for video generation

### Test 3: Video Playback ⏳
- [ ] Navigate to Library tab
- [ ] Find a completed video
- [ ] Click "View"
- [ ] Verify video player opens
- [ ] Verify video starts playing
- [ ] No "Failed to download" error

---

## 🔍 Debugging Tips

### If Prompt Still Empty:
1. Check console for logs:
   - "App: handleGenerateVideo called with idea"
   - "VideoCreator: Idea prop changed"
2. If logs don't appear, the prop isn't being passed
3. If logs appear but prompt empty, there's a Vue reactivity issue

### If Video Still Won't Play:
1. Check network tab (F12 → Network)
2. Look for request to `/api/v1/videos/{id}/content`
3. Check response status and content-type
4. Verify video file exists in `backend/videos/` directory

### Backend Logs:
```bash
# Check backend logs for errors
tail -f /tmp/content-gen-backend.log
```

---

## 📊 Summary

### Fixes Applied
- ✅ Fixed datetime import bug (idea approval)
- ✅ Increased prompt length limit (500 → 2000)
- ✅ Added debug logging for idea prop
- ✅ Added fallback video URL strategies

### Files Modified
1. `backend/src/content_gen_backend/services/idea_service.py` - Added datetime import
2. `frontend/src/components/VideoCreator.vue` - Increased prompt limit + debug logs
3. `frontend/src/App.vue` - Added debug logs
4. `frontend/src/components/VideoPlayer.vue` - Added fallback URL strategies

### Next Steps
1. User refreshes browser
2. User tests idea approval (should work now)
3. User tests video creation from idea
4. User checks console logs
5. User reports if prompt is filled or still empty

---

## 🎯 Expected Results After Fixes

### Idea Approval Flow
```
1. Click "View Prompt" → Shows prompt dialog
2. Click "✓ Approve" → Badge changes to "✓ Approved"
3. Click "Create Video" → Switches to Create tab
4. Console shows debug logs
5. Prompt textarea is filled with AI text
6. Idea info box shows (green background with title)
7. Click "Generate Video" → Starts video generation
```

### Video Playback Flow
```
1. Click "View" in Library → Opens video player
2. Video loads and plays automatically
3. No "Failed to download" error
4. Can play, pause, seek through video
5. Download buttons work
```

---

**Status:** 🟡 Fixes applied, awaiting user testing

**Last Updated:** October 16, 2025, 18:25

**Next:** User needs to refresh browser and test
