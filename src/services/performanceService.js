import { supabase } from "../lib/supabase.js";

/**
 * Performance Review Service - Handles all performance review operations
 */
export const performanceService = {
    /**
     * Get all performance reviews
     * @param {Object} options - Query options
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getReviews({ employeeId = null, reviewerId = null, status = null, period = null } = {}) {
        try {
            let query = supabase
                .from("performance_reviews")
                .select(`
                    *,
                    employee:employees!performance_reviews_employee_id_fkey(id, name, avatar, department, role),
                    reviewer:employees!performance_reviews_reviewer_id_fkey(id, name, avatar)
                `)
                .order("created_at", { ascending: false });

            if (employeeId) query = query.eq("employee_id", employeeId);
            if (reviewerId) query = query.eq("reviewer_id", reviewerId);
            if (status) query = query.eq("status", status);
            if (period) query = query.eq("review_period", period);

            const { data, error } = await query;
            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return { data: [], error };
        }
    },

    /**
     * Get a single review by ID
     * @param {string} reviewId - Review ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getReview(reviewId) {
        try {
            const { data, error } = await supabase
                .from("performance_reviews")
                .select(`
                    *,
                    employee:employees!performance_reviews_employee_id_fkey(*),
                    reviewer:employees!performance_reviews_reviewer_id_fkey(id, name, avatar),
                    goals:performance_goals(*),
                    feedback:performance_feedback(
                        *,
                        provider:employees(id, name, avatar)
                    )
                `)
                .eq("id", reviewId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching review:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a new performance review
     * @param {Object} review - Review data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async createReview(review) {
        try {
            const { data, error } = await supabase
                .from("performance_reviews")
                .insert({
                    employee_id: review.employeeId,
                    reviewer_id: review.reviewerId,
                    review_period: review.reviewPeriod,
                    review_type: review.reviewType || 'annual',
                    status: 'pending',
                    due_date: review.dueDate,
                    categories: review.categories || [],
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating review:", error);
            return { data: null, error };
        }
    },

    /**
     * Update a performance review
     * @param {string} reviewId - Review ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async updateReview(reviewId, updates) {
        try {
            const { data, error } = await supabase
                .from("performance_reviews")
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq("id", reviewId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating review:", error);
            return { data: null, error };
        }
    },

    /**
     * Get goals for an employee
     * @param {string} employeeId - Employee ID
     * @param {string} period - Review period
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getGoals(employeeId, period = null) {
        try {
            let query = supabase
                .from("performance_goals")
                .select("*")
                .eq("employee_id", employeeId)
                .order("created_at", { ascending: false });

            if (period) query = query.eq("period", period);

            const { data, error } = await query;
            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching goals:", error);
            return { data: [], error };
        }
    },

    /**
     * Create a goal
     * @param {Object} goal - Goal data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async createGoal(goal) {
        try {
            const { data, error } = await supabase
                .from("performance_goals")
                .insert({
                    employee_id: goal.employeeId,
                    review_id: goal.reviewId,
                    title: goal.title,
                    description: goal.description,
                    category: goal.category,
                    target_date: goal.targetDate,
                    weight: goal.weight || 1,
                    status: 'not_started',
                    period: goal.period,
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating goal:", error);
            return { data: null, error };
        }
    },

    /**
     * Update goal progress
     * @param {string} goalId - Goal ID
     * @param {Object} updates - Updates
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async updateGoal(goalId, updates) {
        try {
            const { data, error } = await supabase
                .from("performance_goals")
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq("id", goalId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating goal:", error);
            return { data: null, error };
        }
    },

    /**
     * Delete a goal
     * @param {string} goalId - Goal ID
     * @returns {Promise<{error: Error|null}>}
     */
    async deleteGoal(goalId) {
        try {
            const { error } = await supabase
                .from("performance_goals")
                .delete()
                .eq("id", goalId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error deleting goal:", error);
            return { error };
        }
    },

    /**
     * Get feedback requests for a user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getFeedbackRequests(userId) {
        try {
            const { data, error } = await supabase
                .from("feedback_requests")
                .select(`
                    *,
                    review:performance_reviews(
                        id,
                        review_period,
                        employee:employees(id, name, avatar)
                    )
                `)
                .eq("requested_from", userId)
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching feedback requests:", error);
            return { data: [], error };
        }
    },

    /**
     * Request feedback from colleagues
     * @param {string} reviewId - Review ID
     * @param {Array} colleagueIds - Array of colleague IDs
     * @param {string} relationship - Relationship type
     * @returns {Promise<{error: Error|null}>}
     */
    async requestFeedback(reviewId, colleagueIds, relationship) {
        try {
            const requests = colleagueIds.map(id => ({
                review_id: reviewId,
                requested_from: id,
                relationship,
                status: 'pending'
            }));

            const { error } = await supabase
                .from("feedback_requests")
                .insert(requests);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error requesting feedback:", error);
            return { error };
        }
    },

    /**
     * Get skills assessment
     * @param {string} employeeId - Employee ID
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getSkillsAssessment(employeeId) {
        try {
            const { data, error } = await supabase
                .from("skills_assessment")
                .select("*")
                .eq("employee_id", employeeId)
                .order("category");

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching skills:", error);
            return { data: [], error };
        }
    },

    /**
     * Update skills assessment
     * @param {string} employeeId - Employee ID
     * @param {Array} skills - Skills array
     * @returns {Promise<{error: Error|null}>}
     */
    async updateSkillsAssessment(employeeId, skills) {
        try {
            // Delete existing and insert new
            await supabase
                .from("skills_assessment")
                .delete()
                .eq("employee_id", employeeId);

            const skillsData = skills.map(skill => ({
                employee_id: employeeId,
                skill_name: skill.name,
                category: skill.category,
                current_level: skill.currentLevel,
                target_level: skill.targetLevel,
                self_rating: skill.selfRating,
                manager_rating: skill.managerRating,
            }));

            const { error } = await supabase
                .from("skills_assessment")
                .insert(skillsData);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error updating skills:", error);
            return { error };
        }
    },

    /**
     * Get performance analytics for an employee
     * @param {string} employeeId - Employee ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getPerformanceAnalytics(employeeId) {
        try {
            // Get all completed reviews
            let reviewsQuery = supabase
                .from("performance_reviews")
                .select("*")
                .eq("status", "completed")
                .order("created_at", { ascending: true });
                
            if (employeeId) {
                reviewsQuery = reviewsQuery.eq("employee_id", employeeId);
            }
            
            const { data: reviews } = await reviewsQuery;

            // Get goal completion stats
            let goalsQuery = supabase
                .from("performance_goals")
                .select("*");
                
            if (employeeId) {
                goalsQuery = goalsQuery.eq("employee_id", employeeId);
            }
            
            const { data: goals } = await goalsQuery;

            const completedGoals = (goals || []).filter(g => g.status === 'completed').length;
            const totalGoals = (goals || []).length;

            // Calculate trend
            const scores = (reviews || []).map(r => parseFloat(r.overall_score) || 0);
            const trend = scores.length >= 2
                ? scores[scores.length - 1] - scores[scores.length - 2]
                : 0;

            return {
                data: {
                    reviews: reviews || [],
                    scores,
                    averageScore: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0,
                    trend,
                    goalCompletionRate: totalGoals ? ((completedGoals / totalGoals) * 100).toFixed(0) : 0,
                    totalReviews: (reviews || []).length,
                },
                error: null
            };
        } catch (error) {
            console.error("Error fetching analytics:", error);
            return { data: null, error };
        }
    },

    /**
     * Get review cycles (periods)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getReviewCycles() {
        try {
            const { data, error } = await supabase
                .from("review_cycles")
                .select("*")
                .order("start_date", { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching cycles:", error);
            return { data: [], error };
        }
    },

    /**
     * Get team performance summary
     * @param {string} managerId - Manager ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getTeamPerformance(managerId) {
        try {
            // Get team members
            const { data: employees } = await supabase
                .from("employees")
                .select("id, name, avatar, department")
                .eq("manager_id", managerId);

            const employeeIds = (employees || []).map(e => e.id);

            // Get their latest reviews
            const { data: reviews } = await supabase
                .from("performance_reviews")
                .select("*")
                .in("employee_id", employeeIds)
                .eq("status", "completed")
                .order("created_at", { ascending: false });

            // Calculate team stats
            const scoresByEmployee = {};
            (reviews || []).forEach(r => {
                if (!scoresByEmployee[r.employee_id]) {
                    scoresByEmployee[r.employee_id] = parseFloat(r.overall_score) || 0;
                }
            });

            const scores = Object.values(scoresByEmployee);
            const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;

            return {
                data: {
                    employees: employees || [],
                    avgScore,
                    highPerformers: (employees || []).filter(e => scoresByEmployee[e.id] >= 80),
                    needsAttention: (employees || []).filter(e => scoresByEmployee[e.id] < 60),
                    pendingReviews: (reviews || []).filter(r => r.status === 'pending').length,
                },
                error: null
            };
        } catch (error) {
            console.error("Error fetching team performance:", error);
            return { data: null, error };
        }
    }
};
