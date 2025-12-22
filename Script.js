class Course {
    constructor(data) {
        this.id = data.id || 'N/A';
        this.title = data.title || 'N/A';
        this.department = data.department || 'N/A';
        this.level = data.level || 'N/A';
        this.credits = data.credits || 'N/A';
        this.instructor = data.instructor || 'Not assigned';
        this.description = data.description || 'No description available';
        this.semester = data.semester || 'N/A';
    }

    // Method to get semester for sorting
    getSemesterValue() {
        const [season, year] = this.semester.split(' ');
        const seasonOrder = {
            'Winter': 1,
            'Spring': 2,
            'Summer': 3,
            'Fall': 4
        };
        return parseInt(year) * 10 + (seasonOrder[season] || 0);
    }

    // Method to create HTML for course list item
    createListItem() {
        const item = document.createElement('div');
        item.className = 'course-item';
        item.innerHTML = `
            <div class="course-id">${this.id}</div>
            <div class="course-title">${this.title}</div>
            <div class="course-meta">
                <span>${this.department}</span>
                <span>Level ${this.level}</span>
                <span>${this.credits} credits</span>
            </div>
        `;
        return item;
    }

    // Method to create HTML for detailed view
    createDetailView() {
        return `
            <div class="course-detail-header">
                <div class="course-detail-id">${this.id}</div>
                <div class="course-detail-title">${this.title}</div>
            </div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${this.department}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Level:</span>
                    <span class="detail-value">${this.level}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Credits:</span>
                    <span class="detail-value">${this.credits}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Instructor:</span>
                    <span class="detail-value">${this.instructor}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Semester:</span>
                    <span class="detail-value">${this.semester}</span>
                </div>
            </div>
            <div class="course-description">
                <span class="detail-label">Description:</span>
                <p>${this.description}</p>
            </div>
        `;
    }
}

class CourseExplorer {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.currentCourse = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // File upload
        this.fileInput = document.getElementById('fileInput');
        this.fileName = document.getElementById('fileName');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Filters
        this.departmentFilter = document.getElementById('departmentFilter');
        this.levelFilter = document.getElementById('levelFilter');
        this.creditsFilter = document.getElementById('creditsFilter');
        this.instructorFilter = document.getElementById('instructorFilter');
        this.sortSelect = document.getElementById('sortSelect');
        
        // Display areas
        this.courseList = document.getElementById('courseList');
        this.courseDetail = document.getElementById('courseDetail');
    }

    attachEventListeners() {
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Filters and sort
        this.departmentFilter.addEventListener('change', () => this.applyFiltersAndSort());
        this.levelFilter.addEventListener('change', () => this.applyFiltersAndSort());
        this.creditsFilter.addEventListener('change', () => this.applyFiltersAndSort());
        this.instructorFilter.addEventListener('change', () => this.applyFiltersAndSort());
        this.sortSelect.addEventListener('change', () => this.applyFiltersAndSort());
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.fileName.textContent = file.name;
        this.errorMessage.classList.remove('show');

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.loadCourses(jsonData);
            } catch (error) {
                this.showError('Invalid JSON file format. Please upload a valid JSON file.');
                console.error('JSON parsing error:', error);
            }
        };
        
        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
        };
        
        reader.readAsText(file);
    }

    loadCourses(jsonData) {
        try {
            if (!Array.isArray(jsonData)) {
                throw new Error('JSON data must be an array of courses');
            }

            this.courses = jsonData.map(data => new Course(data));
            this.filteredCourses = [...this.courses];
            
            this.populateFilterOptions();
            this.displayCourses();
            this.clearDetailView();
            
        } catch (error) {
            this.showError('Error loading courses: ' + error.message);
        }
    }

    populateFilterOptions() {
        this.populateDepartmentFilter();
        this.populateLevelFilter();
        this.populateCreditsFilter();
        this.populateInstructorFilter();
    }

    populateDepartmentFilter() {
        const departments = [...new Set(this.courses.map(course => course.department))].sort();
        this.populateSelect(this.departmentFilter, departments);
    }

    populateLevelFilter() {
        const levels = [...new Set(this.courses.map(course => course.level))].sort((a, b) => a - b);
        this.populateSelect(this.levelFilter, levels);
    }

    populateCreditsFilter() {
        const credits = [...new Set(this.courses.map(course => course.credits))].sort((a, b) => a - b);
        this.populateSelect(this.creditsFilter, credits);
    }

    populateInstructorFilter() {
        const instructors = [...new Set(this.courses.map(course => course.instructor))].sort();
        this.populateSelect(this.instructorFilter, instructors);
    }

    populateSelect(selectElement, options) {
        // Keep the "All" option
        const allOption = selectElement.querySelector('option[value="all"]');
        selectElement.innerHTML = '';
        selectElement.appendChild(allOption);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    applyFiltersAndSort() {
        this.filteredCourses = this.filterCourses();
        this.sortCourses();
        this.displayCourses();
    }

    filterCourses() {
        return this.courses.filter(course => {
            const departmentMatch = this.departmentFilter.value === 'all' || course.department === this.departmentFilter.value;
            const levelMatch = this.levelFilter.value === 'all' || course.level.toString() === this.levelFilter.value;
            const creditsMatch = this.creditsFilter.value === 'all' || course.credits.toString() === this.creditsFilter.value;
            const instructorMatch = this.instructorFilter.value === 'all' || course.instructor === this.instructorFilter.value;
            
            return departmentMatch && levelMatch && creditsMatch && instructorMatch;
        });
    }

    sortCourses() {
        const sortValue = this.sortSelect.value;
        
        switch (sortValue) {
            case 'id-asc':
                this.filteredCourses.sort((a, b) => a.id.localeCompare(b.id));
                break;
            case 'id-desc':
                this.filteredCourses.sort((a, b) => b.id.localeCompare(a.id));
                break;
            case 'title-asc':
                this.filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                this.filteredCourses.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'semester-asc':
                this.filteredCourses.sort((a, b) => a.getSemesterValue() - b.getSemesterValue());
                break;
            case 'semester-desc':
                this.filteredCourses.sort((a, b) => b.getSemesterValue() - a.getSemesterValue());
                break;
            // 'none' - no sorting
        }
    }

    displayCourses() {
        if (this.filteredCourses.length === 0) {
            this.courseList.innerHTML = '<p class="no-data">No courses match the selected filters</p>';
            return;
        }

        this.courseList.innerHTML = '';
        
        this.filteredCourses.forEach(course => {
            const listItem = course.createListItem();
            
            listItem.addEventListener('click', () => {
                // Remove active class from all items
                document.querySelectorAll('.course-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                listItem.classList.add('active');
                
                // Show course details
                this.showCourseDetail(course);
            });
            
            this.courseList.appendChild(listItem);
        });
    }

    showCourseDetail(course) {
        this.currentCourse = course;
        this.courseDetail.innerHTML = course.createDetailView();
    }

    clearDetailView() {
        this.courseDetail.innerHTML = '<p class="no-data">Select a course to view details</p>';
        this.currentCourse = null;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        
        // Clear any existing courses
        this.courses = [];
        this.filteredCourses = [];
        this.courseList.innerHTML = '<p class="no-data">Please upload a valid JSON file</p>';
        this.clearDetailView();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CourseExplorer();
});